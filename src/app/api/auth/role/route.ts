import { NextRequest, NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getUserRole } from '@/lib/roles';

// ---------------- minimal Firebase Admin helper ----------------
function adminApp() {
  if (getApps().length === 0) {
    const credentialsJson = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";

    const credentials = JSON.parse(credentialsJson);
    initializeApp({ credential: cert(credentials) });
  }
  return getApps()[0];
}

function serverAuth() {
  return getAuth(adminApp());
}


// GET ?uid=...   -> returns { role: ... , claims: {...} }
// POST { uid, role, claims? } -> sets custom claims
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  try {
    const user = await serverAuth().getUser(uid);
    return NextResponse.json({
      uid,
      role: user.customClaims?.role || null,
      claims: user.customClaims || {},
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "lookup failed" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.uid || !body?.role) {
    return NextResponse.json({ error: "uid and role required" }, { status: 400 });
  }

  try {
    const claims = { ...(body.claims || {}), role: body.role };
    await serverAuth().setCustomUserClaims(body.uid, claims);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "update failed" }, { status: 400 });
  }
}
