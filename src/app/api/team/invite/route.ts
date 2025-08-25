// src/app/api/team/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { randomUUID } from "crypto";

// Force Node runtime (needed for 'crypto', Firebase Admin, Stripe, etc.)
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
  if (!body?.teamId || !body?.email || !body?.invitedBy) {
    return NextResponse.json({ error: "teamId, email, invitedBy required" }, { status: 400 });
  }

  const token = randomUUID();

  const doc = {
    teamId: body.teamId,
    email: String(body.email).toLowerCase(),
    role: body.role || "member",
    invitedBy: body.invitedBy,
    status: "PENDING",
    token,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await db().collection("team_invitations").add(doc);
  return NextResponse.json({ ok: true, token });
}