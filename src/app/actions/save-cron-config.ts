"use server";

/**
 * src/app/actions/save-cron-config.ts
 *
 * Saves a global cron configuration document for toggling jobs, intervals, etc.
 * Writes to cron_config/{docId} (default "global").
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
function serverAuth() {
  return getAuth(adminApp());
}
function db() {
  return getFirestore(adminApp());
}
// ------------------------------------------------

type CronConfig = {
  paused?: boolean;
  jobs?: Record<string, { enabled?: boolean; interval?: string }>;
  notes?: string;
};

export async function saveCronConfig(requesterUid: string, config: CronConfig, docId = "global") {
  // Optional: restrict to admins only (adjust claims as needed)
  const user = await serverAuth().getUser(requesterUid).catch(() => null);
  const claims = user?.customClaims || {};
  if (!(claims.admin === true || claims.role === "admin" || claims.role === "super_admin")) {
    throw new Error("Permission denied: admin only.");
  }

  const ref = db().collection("cron_config").doc(docId);
  await ref.set(
    {
      ...config,
      updatedBy: requesterUid,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db().collection("audit_logs").add({
    type: "CRON_CONFIG_UPDATED",
    uid: requesterUid,
    docId,
    createdAt: new Date(),
  });

  return { ok: true };
}