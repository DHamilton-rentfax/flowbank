import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/firebase/server';

const FIVE_DAYS = 60 * 60 * 24 * 5 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ ok: false, error: 'Missing idToken' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);

    // Create a session cookie (server-managed, httpOnly)
    const expiresIn = FIVE_DAYS;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true, uid: decoded.uid });
    res.cookies.set({
      name: '__session',              // Firebase Hosting-friendly cookie name
      value: sessionCookie,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn / 1000,
    });

    return res;
  } catch (e: any) {
    console.error('sessionLogin error:', e?.message || e);
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  }
}