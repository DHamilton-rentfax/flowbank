
import "server-only";
import { cert, getApp, getApps, initializeApp, App, ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function makeApp(): App {
  const serviceAccountB64 = process.env.FIREBASE_ADMIN_CERT_B64;

  if (!serviceAccountB64) {
    throw new Error('FIREBASE_ADMIN_CERT_B64 is missing. Cannot initialize Firebase Admin SDK.');
  }

  try {
    const serviceAccountJson = Buffer.from(serviceAccountB64, 'base64').toString('utf8');
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);
    
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Error parsing service account JSON or initializing app:", error);
    throw new Error("Failed to initialize Firebase Admin SDK due to invalid credentials.");
  }
}

export function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApp();
    return _app;
  }
  _app = makeApp();
  return _app;
}

export function getAdminAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getAdminApp());
  return _auth;
}

export function getAdminDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getAdminApp());
  return _db;
}
