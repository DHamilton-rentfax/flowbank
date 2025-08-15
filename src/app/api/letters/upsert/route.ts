
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';


function getBearer(req: NextRequest) {
  const h = req.headers.get('authorization') || '';
  const [scheme, token] = h.split(' ');
  return /^Bearer$/i.test(scheme) ? token : null;
}

export async function POST(req: NextRequest) {
  try {
    const token = getBearer(req);
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    let decoded;
    try {
      decoded = await getAdminAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // In a real app, you'd check for a specific custom claim like `decoded.admin === true`
    // For now, any authenticated user can do this for simplicity.

    const { title, body } = await req.json();
    if (!title || !body) return NextResponse.json({ error: 'Missing title/body' }, { status: 400 });

    const db = getAdminDb();
    const ref = db.collection('letters').doc(); // new doc each time
    const now = FieldValue.serverTimestamp();
    await ref.set({ title, body, createdAt: now, updatedAt: now });

    return NextResponse.json({ id: ref.id });
  } catch (e) {
    console.error('letters/upsert', e);
    const error = e as Error;
    return NextResponse.json({ error: `Failed to save letter: ${error.message}` }, { status: 500 });
  }
}
