// src/firebase/server.ts
// Server-only Firebase Admin helpers. Never import this from a "use client" file.
import { initializeApp, getApp, getApps, App, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function makeApp(): App {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (json) {
    try {
      console.log("[admin] using GOOGLE_APPLICATION_CREDENTIALS_JSON");
      return initializeApp({ credential: cert(JSON.parse(json)) });
    } catch (e) {
      console.error("[admin] bad GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
    }
  }
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (path) {
    try {
      console.log("[admin] using GOOGLE_APPLICATION_CREDENTIALS file:", path);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const creds = require(path);
      return initializeApp({ credential: cert(creds) });
    } catch (e) {
      console.error("[admin] bad GOOGLE_APPLICATION_CREDENTIALS file:", e);
    }
  }
  console.log("[admin] using ADC");
  return initializeApp();
}

export function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) return (_app = getApp());
  _app = makeApp();
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
