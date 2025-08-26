
// Server-only Firebase Admin bootstrap
// NEVER import this file from client components.

import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK if it hasn't been initialized already
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length) return apps[0];

  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const credentials = JSON.parse(json);
     return initializeApp({ credential: cert(credentials) });
  }

  // Fallback for environments without the B64 var but with individual keys
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Vercel/Next.js automatically handles multiline env vars, but other platforms might need `\n` replaced.
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  
  // If no credentials, fall back to Application Default Credentials (for App Hosting)
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
export const adminAuth = getAdminAuth();
export const db = getAdminDb();


// Optional: tiny helper you can call in routes/actions to verify it's working
export async function adminPing() {
  // Writes/merges a heartbeat doc (requires rules to allow admin writes to _health)
  await db.collection("_health").doc("admin").set({ ts: Date.now() }, { merge: true });
  return { ok: true };
}
