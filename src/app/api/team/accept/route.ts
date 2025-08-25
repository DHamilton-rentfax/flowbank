import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.token || !body?.uid) {
    return NextResponse.json({ error: "token and uid required" }, { status: 400 });
  }

  const snap = await db()
    .collection("team_invitations")
    .where("token", "==", body.token)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const doc = snap.docs[0];
  if (doc.data().status !== "PENDING") {
    return NextResponse.json({ error: "Invite not pending" }, { status: 400 });
  }

  await doc.ref.set(
    {
      status: "ACCEPTED",
      acceptedBy: body.uid,
      acceptedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db().collection("audit_logs").add({
    type: "TEAM_INVITE_ACCEPTED",
    inviteId: doc.id,
    teamId: doc.data().teamId,
    invitedEmail: doc.data().email,
    acceptedBy: body.uid,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true, inviteId: doc.id });
}