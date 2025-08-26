import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";



function getEnvOrThrow(name: string, ...fallbacks: string[]): string {
  const val = [process.env[name], ...fallbacks.map(f => process.env[f])].find(Boolean);
  if (!val) {
    const display = [name, ...fallbacks].join(' or ');
    throw new Error(`Missing required env: ${display}`);
  }
  return val;
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  // Read envs (supports both key names for private key)
  const projectId = getEnvOrThrow('FIREBASE_ADMIN_PROJECT_ID', 'GOOGLE_CLOUD_PROJECT');
  const clientEmail = getEnvOrThrow('FIREBASE_ADMIN_CLIENT_EMAIL');
  const rawKey = getEnvOrThrow('FIREBASE_ADMIN_PRIVATE_KEY', 'FIREBASE_PRIVATE_KEY');

  // Validate formatting (must contain escaped \n in .env)
  const formattedKey = rawKey.replace(/\\n/g, '\n');
  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----') || !formattedKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Firebase Admin PRIVATE KEY env is malformed. Ensure it uses "\\n" escapes and quotes around the value.');
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey: formattedKey }) });
}

const app = getAdminApp();

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json().catch(() => ({}));
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const auth = getAuth(app);

    // Verify the ID token from the client. We don’t revoke here (user is logging in).
    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken, false);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Invalid or expired ID token: ${err?.message || "verifyIdToken failed"}` },
        { status: 401 }
      );
    }

    // Optional: enforce email verification or other checks
    // if (!decoded.email_verified) {
    //   return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    // }

    // Set a short session (adjust as needed)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn }).catch((err: any) => {
      throw new Error(`createSessionCookie failed: ${err?.message || err}`);
    });

    // Cookie options – tweak for your env:
    // - secure: true on production / HTTPS
    // - sameSite: "lax" lets normal navigation keep cookies, but blocks some cross-site posts
    // - domain: usually omit; if you use a custom domain, set it explicitly
    const isProd = process.env.NODE_ENV === "production";

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: "__session",              // Firebase Hosting respects __session by default
      value: sessionCookie,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      // maxAge in seconds (must match expiresIn roughly)
      maxAge: Math.floor(expiresIn / 1000),
    });

    return res;
  } catch (err: any) {
    // Surface a clear message to your hook
    return NextResponse.json(
      { error: err?.message || "Unexpected error in sessionLogin" },
      { status: 500 }
    );
  }
}