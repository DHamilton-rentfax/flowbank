"use server";

/**
 * src/app/actions/get-ai-campaign-targets.ts
 *
 * Builds basic audience segments from a contacts collection:
 * - active (recent engagement)
 * - dormant (no engagements recently)
 * - highValue (spend > threshold)
 * - trialUsers / paidUsers (from billing_status mapping)
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

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
function db() {
  return getFirestore(adminApp());
}
// ------------------------------------------------

type SegmentInput = {
  activeWindowDays?: number; // default 30
  dormantWindowDays?: number; // default 90
  highValueThreshold?: number; // default 500
};

export async function getAICampaignTargets(input: SegmentInput = {}) {
  const activeWindowDays = input.activeWindowDays ?? 30;
  const dormantWindowDays = input.dormantWindowDays ?? 90;
  const highValueThreshold = input.highValueThreshold ?? 500;

  const now = Timestamp.now().toMillis();
  const activeCutoff = Timestamp.fromMillis(now - activeWindowDays * 86400000);
  const dormantCutoff = Timestamp.fromMillis(now - dormantWindowDays * 86400000);

  // Pull contacts (or users) — adapt to your schema
  const contactsSnap = await db().collection("contacts").get().catch(() => null);
  const contacts = contactsSnap?.docs.map((d) => ({ id: d.id, ...d.data() })) || [];

  // Map billing status by uid if available
  const billingSnap = await db().collection("billing_status").get().catch(() => null);
  const billingByUid = new Map<string, any>();
  if (billingSnap) billingSnap.forEach((d) => billingByUid.set(d.id, d.data()));

  const active: any[] = [];
  const dormant: any[] = [];
  const highValue: any[] = [];
  const trialUsers: any[] = [];
  const paidUsers: any[] = [];

  contacts.forEach((c) => {
    const lastActive = c.lastActiveAt || c.lastSeenAt || c.lastEngagementAt || null;
    const spend = Number(c.lifetimeValue || c.totalSpend || 0);
    const uid = c.uid || c.userId || null;
    const bill = uid ? billingByUid.get(uid) : null;

    // Active / Dormant
    if (lastActive?.toMillis ? lastActive.toMillis() > activeCutoff.toMillis() : false) {
      active.push(c);
    } else if (lastActive?.toMillis ? lastActive.toMillis() < dormantCutoff.toMillis() : true) {
      dormant.push(c);
    }

    // High Value
    if (spend >= highValueThreshold) highValue.push(c);

    // Billing segment
    const status = (bill?.subscriptionStatus || "").toString();
    if (status === "trialing") trialUsers.push(c);
    else if (status === "active" || status === "past_due" || status === "unpaid") paidUsers.push(c);
  });

  return {
    counts: {
      total: contacts.length,
      active: active.length,
      dormant: dormant.length,
      highValue: highValue.length,
      trialUsers: trialUsers.length,
      paidUsers: paidUsers.length,
    },
    segments: { active, dormant, highValue, trialUsers, paidUsers },
  };
}