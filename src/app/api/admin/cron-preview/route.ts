
import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/firebase/server';
import parser from 'cron-parser';

export async function GET(req: NextRequest) {
    const sessionCookie = req.cookies.get('__session')?.value;
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);
        if (decodedToken.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const expr = searchParams.get('expr') || '';

    if (!expr) {
        return NextResponse.json({ error: 'Missing cron expression' }, { status: 400 });
    }

    try {
        const interval = parser.parseExpression(expr);
        const next = interval.next().toString();
        const next2 = interval.next().toString();
        return NextResponse.json({ next, next2 });
    } catch (e: any) {
        return NextResponse.json({ error: "Invalid cron expression", details: e?.message || String(e) }, { status: 400 });
    }
}
