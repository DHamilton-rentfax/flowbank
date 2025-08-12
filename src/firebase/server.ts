
import "server-only";
import { cert, getApp, getApps, initializeApp, App, ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function makeApp(): App {
  const serviceAccountEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!serviceAccountEnv) {
    console.warn(
      "[admin] GOOGLE_APPLICATION_CREDENTIALS_JSON is not set. Falling back to ADC (likely to fail in dev)."
    );
    // Fallback to Application Default Credentials if env var is not set.
    return initializeApp();
  }

  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountEnv);
    // Correctly format the private key by replacing escaped newlines.
    if (serviceAccount.privateKey) {
        serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
    }
    
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Error parsing service account JSON or initializing app:", error);
    throw new Error("Failed to initialize Firebase Admin SDK.");
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
