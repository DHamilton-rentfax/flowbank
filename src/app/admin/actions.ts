"use server";

/**
 * src/app/admin/actions.ts
 *
 * Admin utilities:
 * - getEnvSummary: show presence of critical env vars (no secrets)
 * - getFirestoreStats: quick collection counts
 * - setUserRole: set custom claims
 * - toggleFeatureFlag: write feature flags to config/feature_flags
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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
function serverAuth() { return getAuth(adminApp()); }
function db() { return getFirestore(adminApp()); }
// ------------------------------------------------

function assertAdminClaims(claims: any) {
  const role = claims?.role;
  if (!(claims?.admin === true || role === "admin" || role === "super_admin")) {
    throw new Error("Permission denied: admin only.");
  }
}

export async function getEnvSummary() {
  return {
    FIREBASE_ADMIN_CERT_B64: !!process.env.FIREBASE_ADMIN_CERT_B64,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    PLAID_CLIENT_ID: !!process.env.PLAID_CLIENT_ID,
    PLAID_SECRET: !!process.env.PLAID_SECRET,
    PLAID_ENV: process.env.PLAID_ENV || "sandbox",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
    SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
  };
}

export async function getFirestoreStats() {
  const collections = [
    "users",
    "billing_status",
    "stripe_events",
    "plaid_items",
    "plaid_webhooks",
    "audit_logs",
    "team_invitations",
    "campaigns",
    "campaign_sends",
  ];

  const stats: Record<string, number> = {};
  for (const name of collections) {
    const snap = await db().collection(name).limit(1_000).get().catch(() => null);
    stats[name] = snap ? snap.size : 0; // (lightweight count; not total)
  }
  return { collections: stats };
}

export async function setUserRole(requesterUid: string, targetUid: string, role: string, extraClaims?: Record<string, any>) {
  const reqUser = await serverAuth().getUser(requesterUid).catch(() => null);
  assertAdminClaims(reqUser?.customClaims || {});

  const claims = { ...(extraClaims || {}), role };
  await serverAuth().setCustomUserClaims(targetUid, claims);

  await db().collection("audit_logs").add({
    type: "ADMIN_SET_ROLE",
    requesterUid,
    targetUid,
    role,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
}

export async function toggleFeatureFlag(requesterUid: string, key: string, enabled: boolean) {
  const reqUser = await serverAuth().getUser(requesterUid).catch(() => null);
  assertAdminClaims(reqUser?.customClaims || {});

  await db().collection("config").doc("feature_flags").set(
    {
      [key]: { enabled, updatedAt: FieldValue.serverTimestamp(), updatedBy: requesterUid },
    },
    { merge: true }
  );

  await db().collection("audit_logs").add({
    type: "FEATURE_FLAG_TOGGLED",
    key,
    enabled,
    requesterUid,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
}