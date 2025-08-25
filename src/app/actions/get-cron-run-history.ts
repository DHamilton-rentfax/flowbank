"use server";

/**
 * src/app/actions/get-cron-run-history.ts
 *
 * Fetches recent cron job runs for an admin UI.
 * Expects a collection "cron_runs" with documents like:
 * { jobName, status, startedAt, finishedAt, logs[], error }
 */

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
function db() {
  return getFirestore(adminApp());
}
// ------------------------------------------------

export async function getCronRunHistory(limit = 50) {
  const snap = await db()
    .collection("cron_runs")
    .orderBy("startedAt", "desc")
    .limit(Math.max(1, Math.min(200, limit)))
    .get()
    .catch(() => null);

  if (!snap || snap.empty) return [];

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}