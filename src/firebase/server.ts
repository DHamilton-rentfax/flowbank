// src/firebase/server.ts
// Server-only Firebase Admin helpers. Never import this from a "use client" file.
import 'server-only';
import { initializeApp, getApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function makeApp(): App {
    // If that fails, fall back to Application Default Credentials (for production)
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
