
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase/server";

export const runtime = "nodejs";

const COOKIE_NAME = process.env.FIREBASE_AUTH_COOKIE_NAME || '__session';
const COOKIE_DAYS = parseInt(process.env.FIREBASE_AUTH_COOKIE_DAYS || '5', 10);

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { idToken } = (await req.json()) || {};
    if (!idToken) {
      return NextResponse.json({ ok: false, error: 'Missing idToken' }, { status: 400 });
    }

    const expiresIn = COOKIE_DAYS * 24 * 60 * 60 * 1000;
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
        name: COOKIE_NAME,
        value: sessionCookie,
        httpOnly: true,
        secure: isProd,
        sameSite: "lax" as const,
        path: "/",
        maxAge: expiresIn / 1000,
    };

    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookieOptions);
    return res;
    
  } catch (err: any) {
    const code = err?.code || "app/invalid-credential";
    const msg = err?.message || "Failed to create session.";
    console.error("sessionLogin error:", msg, code);
    return NextResponse.json({ ok: false, error: msg, code }, { status: 401 });
  }
}

    