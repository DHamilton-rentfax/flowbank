// src/firebase/server.ts
import 'server-only';
import { initializeApp, getApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function fromJsonEnv() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (!parsed.private_key || !parsed.client_email) {
      console.error('[admin] Malformed GOOGLE_APPLICATION_CREDENTIALS_JSON: Missing private_key or client_email.');
      return null;
    }
    // Handle the escaped newlines in the private key.
    parsed.private_key = String(parsed.private_key).replace(/\\n/g, '\n');
    console.log('[admin] Initializing with GOOGLE_APPLICATION_CREDENTIALS_JSON');
    return cert(parsed);
  } catch (e) {
    console.error('[admin] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', e);
    return null;
  }
}

function fromSplitEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) return null;

  // Handle the escaped newlines in the private key.
  privateKey = privateKey.replace(/\\n/g, '\n');
  console.log('[admin] Initializing with split FIREBASE_* environment variables');
  return cert({ projectId, clientEmail, privateKey });
}

function makeApp(): App {
  // Check for credentials in environment variables first.
  const credential = fromJsonEnv() || fromSplitEnv();

  if (credential) {
    return initializeApp({ credential });
  }

  // If no env vars, fall back to Application Default Credentials (for production on GCP/Firebase).
  console.warn('[admin] No explicit credentials found in environment. Falling back to Application Default Credentials.');
  return initializeApp();
}

export function getAdminApp(): App {
  if (_app) return _app;
  _app = getApps().length > 0 ? getApp() : makeApp();
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
