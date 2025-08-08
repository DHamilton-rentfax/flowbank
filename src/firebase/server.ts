
// src/firebase/server.ts
// Server-only Firebase Admin helpers. Never import this from "use client" file.
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
    if (!parsed.private_key || !parsed.client_email) throw new Error('Missing keys');
    // Some UIs double-escape newlines; fix just in case
    parsed.private_key = String(parsed.private_key).replace(/\\n/g, '\n');
    console.log('[admin] using GOOGLE_APPLICATION_CREDENTIALS_JSON');
    return cert(parsed);
  } catch (e) {
    console.error('[admin] bad GOOGLE_APPLICATION_CREDENTIALS_JSON:', e);
    return null;
  }
}

function fromSplitEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) return null;
  privateKey = privateKey.replace(/\\n/g, '\n');
  console.log('[admin] using FIREBASE_* envs');
  return cert({ projectId, clientEmail, privateKey });
}

function makeApp(): App {
  const jsonCred = fromJsonEnv();
  if (jsonCred) return initializeApp({ credential: jsonCred });

  const splitCred = fromSplitEnv();
  if (splitCred) return initializeApp({ credential: splitCred });

  // Last resort: ADC (works on App Hosting/Cloud Run; flaky locally)
  console.warn('[admin] falling back to ADC');
  return initializeApp();
}

export function getAdminApp(): App {
  if (_app) return _app;
  _app = getApps().length ? getApp() : makeApp();
  return _app!;
}

export function getAdminDb(): Firestore {
  return (_db ||= getFirestore(getAdminApp()));
}

export function getAdminAuth(): Auth {
  return (_auth ||= getAuth(getAdminApp()));
}
