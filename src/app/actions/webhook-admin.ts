"use server";

/**
 * src/app/actions/webhook-admin.ts
 *
 * Small admin helpers to inspect and replay webhook events stored in Firestore.
 * You can wire these into an internal admin UI.
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// -------- Minimal Firebase Admin helper (inline) ----------
function adminApp() {
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";
    const credentials = JSON.parse(json);
    initializeApp({ credential: cert(credentials) });
  }
  return getApps()[0];
}
function serverAuth() {
  return getAuth(adminApp());
}
function db() {
  return getFirestore(adminApp());
}
// ---------------------------------------------------------

function assertAdminClaims(claims: any) {
  const role = claims?.role;
  if (!(claims?.admin === true || role === "admin" || role === "super_admin")) {
    throw new Error("Permission denied: admin only.");
  }
}

export async function listStripeEvents(limit = 50) {
  const snap = await db()
    .collection("stripe_events")
    .orderBy("receivedAt", "desc")
    .limit(Math.max(1, Math.min(200, limit)))
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function replayStripeEvent(eventId: string, requesterUid: string) {
  if (!eventId) throw new Error("eventId is required");
  const user = await serverAuth().getUser(requesterUid).catch(() => null);
  assertAdminClaims(user?.customClaims || {});

  const doc = await db().collection("stripe_events").doc(eventId).get();
  if (!doc.exists) throw new Error("Event not found");

  // In a real replay, you'd re-call your handler logic with this payload.
  // For safety, we only mark a "replayRequested" flag and write an audit record.
  await db().collection("stripe_events").doc(eventId).set(
    {
      replayRequestedAt: new Date(),
      replayRequestedBy: requesterUid,
    },
    { merge: true }
  );

  await db().collection("audit_logs").add({
    type: "STRIPE_EVENT_REPLAY_REQUESTED",
    uid: requesterUid,
    eventId,
    createdAt: new Date(),
  });

  return { ok: true };
}