
// src/firebase/client.ts
import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

type WebConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const firebaseConfig: WebConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function hasConfig(c: WebConfig): c is Required<WebConfig> {
  return !!(c.apiKey && c.authDomain && c.projectId && c.appId);
}

let app: FirebaseApp;

if (!hasConfig(firebaseConfig)) {
  console.warn("Firebase web config missing (NEXT_PUBLIC_*).");
  // In a real app, you might want to throw an error or render a fallback UI.
  // For now, we'll proceed, but Firebase services will fail.
}

if (getApps().length) {
    app = getApp();
} else {
    app = initializeApp(firebaseConfig);
}


export function getClientAuth(): Auth {
  return getAuth(app);
}
export function getClientDb(): Firestore {
  return getFirestore(app);
}

// Compat named exports so existing code `import { auth }` keeps working
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;
