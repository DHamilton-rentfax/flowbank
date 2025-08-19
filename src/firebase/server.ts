
import "server-only";
import { cert, getApp, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function makeApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    // This is the recommended way for Vercel/Next.js
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        // Fallback for local development using Base64 env var
        const serviceAccountB64 = process.env.FIREBASE_ADMIN_CERT_B64;
        if (serviceAccountB64) {
             try {
                const serviceAccountJson = Buffer.from(serviceAccountB64, 'base64').toString('utf8');
                const parsedServiceAccount = JSON.parse(serviceAccountJson);
                 return initializeApp({
                    credential: cert(parsedServiceAccount),
                });
            } catch (error) {
                console.error("Failed to parse FIREBASE_ADMIN_CERT_B64:", error);
                throw new Error("Invalid FIREBASE_ADMIN_CERT_B64 value.");
            }
        }
        // Fallback for emulators or environments with GOOGLE_APPLICATION_CREDENTIALS
        return initializeApp();
    }

    return initializeApp({
        credential: cert(serviceAccount),
    });
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

const adminDb = getAdminDb();
export { adminDb };
