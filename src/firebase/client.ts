// src/firebase/client.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
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

const cfg: WebConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ---- TEMP fallback for Firebase Studio (remove later) ----
// Object.assign(cfg, {
//   apiKey: "<public-api-key>",
//   authDomain: "<your-project>.firebaseapp.com",
//   projectId: "<your-project-id>",
//   storageBucket: "<your-project>.appspot.com",
//   messagingSenderId: "<sender-id>",
//   appId: "<web-app-id>",
// });

function hasConfig(c: WebConfig) {
  return !!(c.apiKey && c.authDomain && c.projectId && c.appId);
}

let _app: FirebaseApp | null = null;
export function getClientApp(): FirebaseApp {
  if (_app) return _app;
  if (!hasConfig(cfg)) {
    throw new Error("Firebase web config missing (NEXT_PUBLIC_*).\n\nIf you are in Firebase Studio, you can temporarily uncomment and populate the `TEMP fallback` section in `src/firebase/client.ts` for testing purposes.\n\nIf you are running locally or deployed, ensure your environment variables are correctly set.");
  }
  _app = getApps()[0] ?? initializeApp(cfg as Required<WebConfig>);
  return _app;
}

export function getClientAuth(): Auth {
  return getAuth(getClientApp());
}
export function getClientDb(): Firestore {
  return getFirestore(getClientApp());
}

// Compat named exports so existing code `import { auth }` keeps working
export const auth: Auth = (() => getClientAuth())();
export const db: Firestore = (() => getClientDb())();

export default getClientApp();