import { NextResponse } from "next/server";
import type { App } from "firebase-admin/app";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, type Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

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

async function getUserById(uid: string) {
  return serverAuth().getUser(uid);
}
// ---------------- end minimal helper ---------------------------


export async function GET() {
  try {
    // Try a simple call to verify admin works
    const time = new Date().toISOString(); // You might replace this with serverTimestamp() if writing
    const collections = await db.listCollections();

    // A simpler health check might just fetch one document or list collections
    // Listing collections proves the admin SDK is initialized and can connect
    // Consider adding more specific checks if needed
    return NextResponse.json({ ok: true, time, collections: collections.map(c => c.id) });
  } catch (e: any) {
    // Catch any errors and return a 500 status with the error message
    console.error("Admin health check failed:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}