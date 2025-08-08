
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { cert, getApps, initializeApp } from "firebase-admin/app";

export const runtime = "nodejs";

function initAdmin() {
  if (!getApps().length) {
    // Try to initialize from split environment variables first
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (projectId && clientEmail && privateKey) {
       initializeApp({ credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }) });
       return;
    }

    // Then try the full JSON environment variable
    const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (credsJson) {
        try {
            const creds = JSON.parse(credsJson);
            creds.private_key = String(creds.private_key).replace(/\\n/g, '\n');
            initializeApp({ credential: cert(creds) });
            return;
        } catch (e) {
             console.error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON; falling back to ADC:", e);
        }
    }
    
    // Finally, fall back to Application Default Credentials
    initializeApp();
  }
}

export async function POST(req: Request) {
  try {
    initAdmin();
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
    }

    const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return res;
  } catch (err: any) {
    const code = err?.code || err?.errorInfo?.code || "app/invalid-credential";
    const msg = err?.message || err?.errorInfo?.message || "Failed to create session.";
    console.error("sessionLogin error:", code, msg);
    return NextResponse.json({ ok: false, error: msg, code }, { status: 401 });
  }
}
