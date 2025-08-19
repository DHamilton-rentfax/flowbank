
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/server';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb.collection('teamAuditLogs').orderBy('timestamp', 'desc').limit(100).get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    console.error('Audit Log Error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch logs' }, { status: 500 });
  }
}
