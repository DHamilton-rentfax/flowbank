export const runtime = "nodejs";

import { cert, getApps, initializeApp } from "firebase-admin/app";

export async function GET() {
  try {
    const raw = process.env.FIREBASE_ADMIN_CERT_JSON;
    if (!raw) throw new Error("Missing FIREBASE_ADMIN_CERT_JSON");
    const creds = JSON.parse(raw);

    // Try to initialize (no-op if already done) or get existing app
    const app = getApps().length === 0 ? initializeApp({ credential: cert(creds), projectId: creds.project_id }) : getApps()[0];

    return new Response(JSON.stringify({
      ok: true,
      project_id: creds.project_id,
      client_email: creds.client_email,
      has_private_key: !!creds.private_key,
      private_key_prefix: String(creds.private_key || "").slice(0, 30), // should start with '-----BEGIN PRIVATE KEY-----'
    }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || String(e) }), { status: 500 });
  }
}