
// Server-only Firebase Admin bootstrap
// NEVER import this file from client components.

import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK if it hasn't been initialized already
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length) return apps[0];

  // Prefer env (helps local dev), else fall back to ADC (works on App Hosting)
  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (b64) {
    const json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    return initializeApp({ credential: cert(json) });
  }

  // ✅ No key needed in App Hosting:
  return initializeApp();
}

const app = getAdminApp();

export function getAdminAuth(): Auth {
    return getAuth(app);
}

export function getAdminDb(): Firestore {
    return getFirestore(app);
}

// Compat named exports
export const adminAuth = getAuth(app);
export const db = getFirestore(app);


// Optional: tiny helper you can call in routes/actions to verify it's working
export async function adminPing() {
  // Writes/merges a heartbeat doc (requires rules to allow admin writes to _health)
  await db.collection("_health").doc("admin").set({ ts: Date.now() }, { merge: true });
  return { ok: true };
}
