
import "server-only";
import { cert, getApp, getApps, initializeApp, App, ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function makeApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    const serviceAccountB64 = process.env.FIREBASE_ADMIN_CERT_B64;
    if (serviceAccountB64) {
        try {
            const serviceAccountJson = Buffer.from(serviceAccountB64, 'base64').toString('utf8');
            const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);
            
            return initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (error) {
            console.error("Failed to parse FIREBASE_ADMIN_CERT_B64:", error);
            throw new Error("Invalid FIREBASE_ADMIN_CERT_B64 value — check your base64 encoding.");
        }
    }

    // Fallback for local development or environments with GOOGLE_APPLICATION_CREDENTIALS
    return initializeApp();
}

export function getAdminApp(): App {
  if (_app) return _app;
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
