import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/server';
import { getUserRole } from '@/lib/roles';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json().catch(() => ({}));
    if (!idToken) return NextResponse.json({ ok:false, error:'Missing idToken' }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const role = await getUserRole(uid);
    return NextResponse.json({ ok:true, uid, role });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error:e?.message || 'Invalid token' }, { status: 401 });
  }
}
