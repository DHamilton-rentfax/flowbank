"use server";

/**
 * src/app/actions/get-admin-analytics.ts
 *
 * Returns summary analytics for your admin dashboards:
 * - activeUsers (last 30d based on audit_logs)
 * - newUsersThisWeek
 * - paidUsers / freeUsers (from billing_status)
 * - pendingInvites / acceptedInvites (from team_invitations)
 * - webhookStatus (last Stripe/Plaid webhook timestamps)
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

export async function getAdminAnalytics() {
  const now = Timestamp.now();
  const thirtyDaysAgo = Timestamp.fromMillis(now.toMillis() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000);

  // Active users in last 30d (based on audit_logs with uid)
  const recentAudits = await db()
    .collection("audit_logs")
    .where("createdAt", ">", thirtyDaysAgo)
    .get();
  const activeSet = new Set<string>();
  recentAudits.docs.forEach((d) => {
    const uid = (d.data().uid || "").toString();
    if (uid) activeSet.add(uid);
  });

  // New users this week (users collection optional)
  let newUsersThisWeek = 0;
  const usersQuery = await db().collection("users").where("createdAt", ">", sevenDaysAgo).get().catch(() => null);
  if (usersQuery?.empty === false) newUsersThisWeek = usersQuery.size;

  // Billing status snapshot (count paid/free)
  const billSnap = await db().collection("billing_status").get().catch(() => null);
  let paidUsers = 0;
  let freeUsers = 0;
  if (billSnap) {
    billSnap.forEach((doc) => {
      const s = doc.data();
      const status = (s.subscriptionStatus || "").toString();
      if (status === "active" || status === "trialing" || status === "past_due" || status === "unpaid") {
        paidUsers += 1;
      } else {
        freeUsers += 1;
      }
    });
  }

  // Team invites
  const pendingInvitesSnap = await db().collection("team_invitations").where("status", "==", "PENDING").get().catch(() => null);
  const acceptedInvitesSnap = await db().collection("team_invitations").where("status", "==", "ACCEPTED").get().catch(() => null);
  const pendingInvites = pendingInvitesSnap?.size || 0;
  const acceptedInvites = acceptedInvitesSnap?.size || 0;

  // Webhook health (last timestamps)
  const stripeLast = await db()
    .collection("stripe_events")
    .orderBy("receivedAt", "desc")
    .limit(1)
    .get()
    .then((s) => (s.empty ? null : s.docs[0].data().receivedAt))
    .catch(() => null);

  const plaidLast = await db()
    .collection("plaid_webhooks")
    .orderBy("receivedAt", "desc")
    .limit(1)
    .get()
    .then((s) => (s.empty ? null : s.docs[0].data().receivedAt))
    .catch(() => null);

  const webhookStatus = {
    stripeLast,
    plaidLast,
    ok: Boolean(stripeLast || plaidLast),
  };

  return {
    activeUsers: activeSet.size,
    newUsersThisWeek,
    paidUsers,
    freeUsers,
    pendingInvites,
    acceptedInvites,
    webhookStatus,
    generatedAt: new Date().toISOString(),
  };
}