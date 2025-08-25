"use server";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin helper
function adminApp() {
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";
    initializeApp({ credential: cert(JSON.parse(json)), projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
  }
  return getApps()[0];
}
function db() {
  return getFirestore(adminApp());
}

/**
 * Fetches cron job configuration from Firestore
 */
export async function getCronConfig() {
  const snap = await db().collection("cron_config").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}