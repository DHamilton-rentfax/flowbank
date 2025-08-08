
import "server-only";
import { cert, getApp, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function makeApp(): App {
  // Try JSON env
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (json) {
    const parsed = JSON.parse(json);
    parsed.private_key = String(parsed.private_key).replace(/\\n/g, "\n");
    console.log("[admin] using JSON env");
    return initializeApp({ credential: cert(parsed) });
  }
  // Try split envs
  const pid = process.env.FIREBASE_PROJECT_ID;
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  let key = process.env.FIREBASE_PRIVATE_KEY;
  if (pid && email && key) {
    key = key.replace(/\\n/g, "\n");
    console.log("[admin] using split envs");
    return initializeApp({ credential: cert({ projectId: pid, clientEmail: email, privateKey: key }) });
  }
  console.warn("[admin] falling back to ADC (likely to fail in dev)");
  return initializeApp();
}

export function getAdminApp(): App {
  if (_app) return _app;
  _app = getApps().length ? getApp() : makeApp();
  return _app;
}
export function getAdminAuth(): Auth { return (_auth ||= getAuth(getAdminApp())); }
export function getAdminDb(): Firestore { return (_db ||= getFirestore(getAdminApp())); }
