/**
 * src/lib/billing.ts
 *
 * Plan helpers + gating for FlowBank tiers and add-ons.
 * NOTE: This file uses Firebase Admin. Import only in server code/server actions.
 */

if (typeof window !== "undefined") {
  throw new Error("src/lib/billing.ts must not be imported in the browser bundle.");
}

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// -------- Minimal Firebase Admin helper ----------
function adminApp() {
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";
    initializeApp({ credential: cert(JSON.parse(json)) });
  }
  return getApps()[0];
}
function db() { return getFirestore(adminApp()); }
// ------------------------------------------------

// Finalized tiers & lookup keys (from your saved memory)
export const PLAN_LOOKUPS = {
  free_monthly: "price_free_monthly",
  starter_monthly: "price_starter_monthly",
  starter_annual: "price_starter_annual",
  pro_monthly: "price_pro_monthly",
  pro_annual: "price_pro_annual",
  // Enterprise handled manually
};

export type PlanTier = "free" | "starter" | "pro" | "enterprise";

export function resolvePlanFromLookup(lookup?: string | null): PlanTier {
  if (!lookup) return "free";
  const lk = lookup.toLowerCase();
  if (lk.includes("starter")) return "starter";
  if (lk.includes("pro")) return "pro";
  return "free"; // enterprise handled via role or manual flag
}

export type BillingStatus = {
  subscriptionId?: string;
  subscriptionStatus?: string; // active, trialing, past_due, canceled, unpaid, etc
  planLookupKey?: string | null;
  addOns?: Record<string, { active: boolean; quantity?: number }>;
};

// External account limits (approved)
export function externalAccountLimitFor(plan: PlanTier): number | "unlimited" {
  switch (plan) {
    case "free": return 0;
    case "starter": return 1;
    case "pro": return 5;
    case "enterprise": return "unlimited";
    default: return 0;
  }
}

// Generic feature flags per plan
export function featuresFor(plan: PlanTier) {
  return {
    canConnectBank: true,
    incomeSplits: plan !== "free",
    aiAdvisorBasic: plan !== "free",    // limited at Starter
    aiAdvisorFull: plan === "pro" || plan === "enterprise",
    prioritySupport: plan === "pro" || plan === "enterprise",
    analyticsDashboard: plan !== "free",
  };
}

export async function getBillingStatus(uid: string): Promise<BillingStatus | null> {
  const doc = await db().collection("billing_status").doc(uid).get().catch(() => null);
  return doc && doc.exists ? (doc.data() as BillingStatus) : null;
}

export async function getUserPlan(uid: string): Promise<PlanTier> {
  const s = await getBillingStatus(uid);
  if (!s) return "free";
  // enterprise may be flagged in billing_status or via roles elsewhere
  const plan = resolvePlanFromLookup(s.planLookupKey || null);
  return plan;
}

export async function hasFeature(uid: string, featureKey: keyof ReturnType<typeof featuresFor>): Promise<boolean> {
  const plan = await getUserPlan(uid);
  const f = featuresFor(plan);
  return Boolean((f as any)[featureKey]);
}

export async function externalAccountsRemaining(uid: string, currentCount: number): Promise<number | "unlimited"> {
  const plan = await getUserPlan(uid);
  const limit = externalAccountLimitFor(plan);
  if (limit === "unlimited") return "unlimited";
  return Math.max(0, limit - currentCount);
}

// Example add-on: AI Optimization (lookup keys in memory)
export const ADDONS = {
  aiOptimization: {
    monthly: "addon_ai_optimization",
    annual: "addon_ai_optimization_annual",
  },
};

export async function isAddonActive(uid: string, key: keyof typeof ADDONS): Promise<boolean> {
  const s = await getBillingStatus(uid);
  const active = s?.addOns?.[key]?.active === true;
  return active;
}