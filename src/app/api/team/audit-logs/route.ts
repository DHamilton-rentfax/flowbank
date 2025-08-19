
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/server';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    // Note: The collection is 'teamAuditLogs', not 'audit_logs' as per the existing actions.
    const snapshot = await db.collection('teamAuditLogs').orderBy('timestamp', 'desc').limit(100).get();
    
    const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to a JSON-serializable format (ISO string)
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : null;
        return {
          id: doc.id,
          ...data,
          timestamp: timestamp,
        };
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Audit Log API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch logs';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
