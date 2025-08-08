// src/firebase/server.ts
// Server-only Firebase Admin helpers. Never import this from a "use client" file.
import { initializeApp, getApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) return (_app = getApp());

  // If any of the required cert fields are missing, fall back to ADC immediately
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Only use a cert if ALL values look valid
  const canUseCert = Boolean(projectId && clientEmail && privateKey);

  if (canUseCert) {
    if (privateKey!.includes("\\n")) privateKey = privateKey!.replace(/\\n/g, "\n");
    try {
      _app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
      return _app;
    } catch (e) {
      // If the cert is bad, log and fall back to ADC
      console.error("Admin cert init failed; falling back to ADC:", e);
    }
  }

  // ADC (works out of the box on Firebase App Hosting)
  _app = initializeApp();
  return _app;
}

export function getAdminDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getAdminApp());
  return _db;
}

export function getAdminAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getAdminApp());
  return _auth;
}
