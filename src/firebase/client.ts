// src/firebase/client.ts
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  getAuth,
  type Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!, // must be in Authorized Domains
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Singleton auth: initialize once on the client with resolver + persistence
let _auth: Auth | undefined;

export function getClientAuth(): Auth {
  if (typeof window === 'undefined') {
    // Never initialize auth on the server
    throw new Error('Client auth requested on server.');
  }
  if (_auth) return _auth;

  try {
    // If another module already initialized it
    _auth = getAuth(app);
  } catch {
    // First time: set persistence + popup resolver
    _auth = initializeAuth(app, {
      persistence: [browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  }
  return _auth!;
}

// Export the initialized auth for convenience, but prefer getClientAuth()
export const auth = getClientAuth();
