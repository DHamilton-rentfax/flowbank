
import { NextRequest, NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Firestore, WriteBatch } from "firebase-admin/firestore";


// ---------------- minimal Firebase Admin helper ----------------
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

function db(): Firestore {
  return getFirestore(adminApp());
}
// ---------------- end minimal helper ---------------------------
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
      decoded = await serverAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // In a real app, you'd check for a specific custom claim like `decoded.admin === true`
    // For now, any authenticated user can do this for simplicity.

    const { title, body } = await req.json();
    if (!title || !body) return NextResponse.json({ error: 'Missing title/body' }, { status: 400 });

    const firestore = db();
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
