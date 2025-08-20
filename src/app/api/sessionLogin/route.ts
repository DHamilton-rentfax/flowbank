import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { idToken } = await req.json().catch(() => ({}));
  if (!idToken) return NextResponse.json({ ok:false, error:'Missing idToken' }, { status: 400 });

  try {
    // Validate ID token and mint a session cookie, set cookie header, etc.
    await adminAuth.verifyIdToken(idToken);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error:e?.message || 'Invalid token' }, { status: 401 });
  }
}