// src/app/api/sessionLogin/route.ts
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminAuth() {
  const raw = process.env.FIREBASE_ADMIN_CERT_JSON;
  if (!raw) throw new Error("FIREBASE_ADMIN_CERT_JSON missing");
  const creds = JSON.parse(raw);
  if (creds.project_id !== "flow-bank-app") {
    throw new Error(`Service account project_id=${creds.project_id} (expected flow-bank-app)`);
  }
  const app = getApps().length === 0 ? initializeApp({ credential: cert(creds), projectId: creds.project_id }) : getApps()[0];
  return getAuth(app);
}

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json().catch(() => ({}));
    if (!idToken) return new Response(JSON.stringify({ ok:false, error:"Missing idToken" }), { status: 400 });

    const auth = getAdminAuth();

    // precise error if mismatch/expired/bad key
    const decoded = await auth.verifyIdToken(idToken, true);

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const isProd = process.env.NODE_ENV === "production";
    cookies().set("session", sessionCookie, {
      httpOnly: true,
      secure: isProd,           // IMPORTANT: false on localhost so cookie sets
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return new Response(JSON.stringify({ ok: true, uid: decoded.uid }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok:false, error: e?.message || String(e) }), { status: 401 });
  }
}