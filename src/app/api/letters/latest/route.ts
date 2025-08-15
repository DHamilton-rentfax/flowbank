
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/server';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const snap = await db.collection('letters').orderBy('createdAt', 'desc').limit(1).get();
    
    if (snap.empty) {
      return NextResponse.json({ letter: null });
    }

    const doc = snap.docs[0];
    const data = doc.data();

    // Convert Firestore Timestamp to JSON-compatible format (ISO string)
    const letterData = {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
    };
    
    return NextResponse.json({ id: doc.id, letter: letterData });
  } catch (e) {
    console.error('letters/latest', e);
    const error = e as Error;
    return NextResponse.json({ error: `Failed to fetch latest letter: ${error.message}` }, { status: 500 });
  }
}
