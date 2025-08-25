"use server";

import { cookies } from "next/headers";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// ---------- Minimal Admin initializer (server-only) ----------
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    return initializeApp({ credential: cert(JSON.parse(json)) });
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/
/g, "
");
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}
// ------------------------------------------------------------

export type Plan = "free" | "starter" | "pro" | "enterprise";

export async function getCurrentUser() {
  const name = process.env.NODE_ENV === "production" ? "__Secure-fbSession" : "fbSession";
  const session = (await cookies()).get(name)?.value;
  if (!session) return null;
  try {
    const auth = getAuth(getAdminApp());
    const decoded = await auth.verifySessionCookie(session, true);
    return { uid: decoded.sub, email: decoded.email || null };
  } catch {
    return null;
  }
}

export async function getUserPlan(): Promise<Plan> {
  const user = await getCurrentUser();
  if (!user) return "free";
  const db = getFirestore(getAdminApp());
  const snap = await db.collection("users").doc(user.uid).get();
  return ((snap.exists && (snap.data()?.plan as Plan)) || "free") as Plan;
}

export function splitLimitForPlan(plan: Plan): number | "unlimited" {
  if (plan === "enterprise") return "unlimited";
  if (plan === "pro") return 5;
  if (plan === "starter") return 1;
  return 0; // free
}

export async function getExternalAccounts() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  const db = getFirestore(getAdminApp());
  const col = await db
    .collection("users")
    .doc(user.uid)
    .collection("externalAccounts")
    .orderBy("createdAt", "desc")
    .get();
  return col.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function canAddExternalAccount() {
  const plan = await getUserPlan();
  const limit = splitLimitForPlan(plan);
  if (limit === "unlimited") return { allowed: true, limit, remaining: "unlimited" as const };
  const list = await getExternalAccounts();
  const remaining = Math.max(0, limit === "unlimited" ? Infinity : limit - list.length);
  return { allowed: remaining > 0, limit, remaining };
}

export async function createExternalAccount(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const { allowed, remaining } = await canAddExternalAccount();
  if (!allowed) throw new Error(`Limit reached. Remaining: ${remaining}`);

  const routing = String(formData.get("routing") || "").trim();
  const account = String(formData.get("account") || "").trim();
  const nickname = String(formData.get("nickname") || "").trim();

  if (!routing || !account || !nickname) throw new Error("All fields required");

  const last4 = account.slice(-4);

  const db = getFirestore(getAdminApp());
  const ref = db.collection("users").doc(user.uid).collection("externalAccounts").doc();
  await ref.set({
    routingMasked: `••••${routing.slice(-4)}`,
    accountMasked: `••••${last4}`,
    nickname,
    createdAt: Timestamp.now(),
  });
  return { ok: true };
}

export async function removeExternalAccount(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  const db = getFirestore(getAdminApp());
  await db.collection("users").doc(user.uid).collection("externalAccounts").doc(id).delete();
  return { ok: true };
}

/**
 * AI Financial Advisor (lightweight, private, deterministic)
 * - Reads last 90 days of transactions from /users/{uid}/transactions
 *   Expected shape: { amount: number (cents or +/-), category: string, merchant: string, date: Timestamp }
 * - Produces insights, recurring detection, budget suggestions.
 * - If no data, returns demo insights so the UI still works.
 */
export type AISuggestion = {
  title: string;
  detail: string;
  impactPerMonth?: number; // positive means savings
};

export async function getAIFinancialAnalysis(): Promise<{
  timeframeDays: number;
  sampleCount: number;
  monthlySpend: number;
  recurring: { merchant: string; average: number }[];
  suggestions: AISuggestion[];
}> {
  const user = await getCurrentUser();
  if (!user) {
    // public demo
    return {
      timeframeDays: 90,
      sampleCount: 10,
      monthlySpend: 1200_00,
      recurring: [
        { merchant: "DemoGym", average: 39_99 },
        { merchant: "MoviePlus", average: 12_99 },
      ],
      suggestions: [
        { title: "Consolidate subscriptions", detail: "Cancel MoviePlus (duplicate with other service).", impactPerMonth: 12_99 },
        { title: "Round-up savings", detail: "Enable auto round-up to divert ~$25/month to savings.", impactPerMonth: 25_00 },
      ],
    };
  }

  const db = getFirestore(getAdminApp());
  const cutoff = Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
  const snap = await db
    .collection("users")
    .doc(user.uid)
    .collection("transactions")
    .where("date", ">=", cutoff)
    .get();

  const txs = snap.docs.map((d) => d.data() as any);

  if (txs.length === 0) {
    return {
      timeframeDays: 90,
      sampleCount: 0,
      monthlySpend: 0,
      recurring: [],
      suggestions: [
        { title: "Connect your bank", detail: "Link your account to unlock AI insights." },
      ],
    };
  }

  // Normalize cents
  const amounts = txs.map((t) => Math.round(Number(t.amount)));
  const totalOut = amounts.filter((a) => a < 0).reduce((a, b) => a + b, 0); // negative
  const monthlySpend = Math.abs(Math.round((totalOut / 90) * 30));

  // Recurring detection: merchant seen in >= 2 months with similar amount (+/- $3)
  const byMerchant = new Map<string, number[]>();
  for (const t of txs) {
    if (t.amount < 0 && t.merchant) {
      const arr = byMerchant.get(t.merchant) || [];
      arr.push(Math.abs(Math.round(Number(t.amount))));
      byMerchant.set(t.merchant, arr);
    }
  }
  const recurring: { merchant: string; average: number }[] = [];
  for (const [merchant, arr] of byMerchant.entries()) {
    if (arr.length >= 2) {
      const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      // simple dispersion filter
      const within = arr.filter((v) => Math.abs(v - avg) <= 300).length;
      if (within >= 2) recurring.push({ merchant, average: avg });
    }
  }
  recurring.sort((a, b) => b.average - a.average);

  const suggestions: AISuggestion[] = [];

  if (monthlySpend > 1000_00) {
    suggestions.push({
      title: "Cap discretionary spending",
      detail: "Your monthly discretionary spend exceeds $1,000. Set a weekly cap and use split rules to auto-move surplus to savings.",
      impactPerMonth: Math.round(monthlySpend * 0.1),
    });
  }
  if (recurring.length > 0) {
    const top = recurring[0];
    suggestions.push({
      title: `Audit subscriptions (e.g., ${top.merchant})`,
      detail: "Review top recurring charges. Cancel unused services or switch to annual billing if cheaper.",
      impactPerMonth: Math.round(top.average * 0.5),
    });
  }
  if (monthlySpend > 0) {
    suggestions.push({
      title: "Automate savings",
      detail: "Create a split to move 10% of each income to 'Taxes' and 5% to 'Emergency'.",
      impactPerMonth: Math.round(monthlySpend * 0.15 * 0.1), // rough
    });
  }

  return {
    timeframeDays: 90,
    sampleCount: txs.length,
    monthlySpend,
    recurring: recurring.slice(0, 5),
    suggestions,
  };
}

/** Accept team invite (placeholder: stores a join and sets membership) */
export async function acceptInvite(inviteId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  const db = getFirestore(getAdminApp());
  const invRef = db.collection("invites").doc(inviteId);
  const inv = await invRef.get();
  if (!inv.exists) throw new Error("Invite not found");

  const { orgId, role = "member" } = inv.data() as any;
  const batch = db.batch();
  batch.set(db.collection("orgs").doc(orgId).collection("members").doc(user.uid), {
    role,
    joinedAt: Timestamp.now(),
    email: user.email || null,
  });
  batch.set(db.collection("audit").doc(), {
    type: "MEMBER_JOINED",
    orgId,
    actor: user.uid,
    at: Timestamp.now(),
  });
  batch.delete(invRef);
  await batch.commit();
  return { ok: true, orgId };
}