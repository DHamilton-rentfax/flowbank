// src/firebase/server.ts
// Server-only Firebase Admin helpers. Never import this from "use client" file.
import 'server-only';
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function makeApp(): App {
  // Use Application Default Credentials.
  // This is the standard and recommended way for Firebase/Google Cloud environments.
  return initializeApp();
}

export function getAdminApp(): App {
  if (_app) return _app;
  _app = getApps().length ? getApp() : makeApp();
  return _app!;
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
