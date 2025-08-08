
// src/firebase/server.ts
// Server-only Firebase Admin helpers. Never import this from a "use client" file.
import { initializeApp, getApp, getApps, App, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function makeApp(): App {
  // 1) Prefer explicit JSON creds (dev/workstation)
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credsJson) {
    try {
      const creds = JSON.parse(credsJson);
      return initializeApp({ credential: cert(creds) });
    } catch (e) {
      console.error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON; falling back to ADC:", e);
    }
  }

  // 2) Optional: support file path if you prefer
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credsPath) {
    try {
      const json = require(credsPath);
      return initializeApp({ credential: cert(json) });
    } catch (e) {
      console.error("Invalid GOOGLE_APPLICATION_CREDENTIALS file; falling back to ADC:", e);
    }
  }

  // 3) ADC (works on Firebase App Hosting / GCP)
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
