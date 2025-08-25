"use server";

/**
 * src/app/teams/actions.ts
 *
 * Basic team actions:
 * - getTeamInfo(teamId)
 * - addMember(teamId, uid, role)
 * - removeMember(teamId, uid)
 * - updateMemberRole(teamId, uid, role)
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

export async function getTeamInfo(teamId: string) {
  const team = await db().collection("teams").doc(teamId).get().catch(() => null);
  const teamData = team?.exists ? team.data() : null;

  const membersSnap = await db().collection("team_members").where("teamId", "==", teamId).get().catch(() => null);
  const members = membersSnap?.docs.map((d) => ({ id: d.id, ...d.data() })) || [];

  const invitesSnap = await db().collection("team_invitations").where("teamId", "==", teamId).get().catch(() => null);
  const invites = invitesSnap?.docs.map((d) => ({ id: d.id, ...d.data() })) || [];

  return { team: teamData, members, invites };
}

export async function addMember(requesterUid: string, teamId: string, uid: string, role: string = "member") {
  const requester = await serverAuth().getUser(requesterUid).catch(() => null);
  const claims = requester?.customClaims || {};
  if (!(claims.admin === true || claims.role === "admin" || claims.role === "super_admin")) {
    throw new Error("Permission denied: admin only.");
  }

  const ref = db().collection("team_members").doc(`${teamId}_${uid}`);
  await ref.set(
    { teamId, uid, role, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );

  await db().collection("audit_logs").add({
    type: "MEMBER_JOINED",
    teamId,
    uid,
    role,
    createdAt: new Date(),
  });

  return { ok: true };
}

export async function removeMember(requesterUid: string, teamId: string, uid: string) {
  const requester = await serverAuth().getUser(requesterUid).catch(() => null);
  const claims = requester?.customClaims || {};
  if (!(claims.admin === true || claims.role === "admin" || claims.role === "super_admin")) {
    throw new Error("Permission denied: admin only.");
  }

  const ref = db().collection("team_members").doc(`${teamId}_${uid}`);
  await ref.delete().catch(() => null);

  await db().collection("audit_logs").add({
    type: "MEMBER_REMOVED",
    teamId,
    uid,
    createdAt: new Date(),
  });

  return { ok: true };
}

export async function updateMemberRole(requesterUid: string, teamId: string, uid: string, role: string) {
  const requester = await serverAuth().getUser(requesterUid).catch(() => null);
  const claims = requester?.customClaims || {};
  if (!(claims.admin === true || claims.role === "admin" || claims.role === "super_admin")) {
    throw new Error("Permission denied: admin only.");
  }

  const ref = db().collection("team_members").doc(`${teamId}_${uid}`);
  await ref.set(
    { role, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );

  await db().collection("audit_logs").add({
    type: "MEMBER_ROLE_UPDATED",
    teamId,
    uid,
    role,
    createdAt: new Date(),
  });

  return { ok: true };
}