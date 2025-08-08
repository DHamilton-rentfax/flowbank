
// src/firebase/server.ts
// Server-only Firebase Admin helpers. Never import this from a "use client" file.
import { initializeApp, getApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) return (_app = getApp());

  // FORCE ADC ONLY – no credential: cert(...)
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
