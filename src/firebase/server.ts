
import * as admin from 'firebase-admin';
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";

function getAdminApp() {
  if (getApps().length) return getApp();

  // Prefer explicit creds when provided, else fall back to ADC in Firebase hosting
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey?.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  // In Firebase App Hosting, default credentials should exist
  return initializeApp();
}

const db = getAdminApp().firestore();
const auth = getAdminApp().auth();

export { getAdminApp, db, auth };
