
import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/firebase/server';

const MOCK_TEAM_ID = 'defaultTeam';

export async function GET(req: NextRequest) {
    const sessionCookie = req.cookies.get('__session')?.value;
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decodedToken;
    try {
        decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const db = getAdminDb();
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const teamId = userDoc.data()?.teamId || MOCK_TEAM_ID;

        const logsSnap = await db.collection('teams').doc(teamId).collection('auditLogs')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: `Failed to fetch audit logs: ${errorMessage}` }, { status: 500 });
    }
}
