import { NextRequest, NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

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

function db(): Firestore {
  return getFirestore(adminApp());
}
// ---------------- end minimal helper ---------------------------

export async function GET(req: NextRequest) {
  try {
    const firestore = db();
    const snap = await firestore
      .collection('letters')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
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
