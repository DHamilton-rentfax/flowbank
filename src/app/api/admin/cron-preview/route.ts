import { type NextRequest, NextResponse } from 'next/server';
import parser from 'cron-parser';

// ---------------- minimal Firebase Admin helper ----------------
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function adminApp() {
  if (getApps().length === 0) {
    const credentialsJson = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";

    const credentials = JSON.parse(credentialsJson);
    initializeApp({ credential: cert(credentials) });
  }
  return getApps()[0];
}

function serverAuth() {
  return getAuth(adminApp());
}

async function getUserById(uid: string) {
  return serverAuth().getUser(uid);
}
// ---------------- end minimal helper ---------------------------


export async function GET(req: NextRequest) {
    const sessionCookie = req.cookies.get('__session')?.value;
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decodedToken = await serverAuth().verifySessionCookie(sessionCookie, true);
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
