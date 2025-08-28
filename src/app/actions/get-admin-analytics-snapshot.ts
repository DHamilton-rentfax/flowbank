"use server";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

/**
 * Provides a summary snapshot for the Launch Status dashboard
 */
export async function getAdminAnalyticsSnapshot() {
  const usersSnap = await db().collection("users").get();
  const invitesSnap = await db().collection("team_invitations").get();

  const paidUsers = usersSnap.docs.filter((u) => u.data().plan !== "free").length;
  const freeUsers = usersSnap.size - paidUsers;

  return {
    activeUsers: usersSnap.size,
    paidUsers,
    freeUsers,
    pendingInvites: invitesSnap.docs.filter((i) => i.data().status === "PENDING").length,
    acceptedInvites: invitesSnap.docs.filter((i) => i.data().status === "ACCEPTED").length,
    webhookStatus: "ok", // stub — extend later if needed
  };
}
