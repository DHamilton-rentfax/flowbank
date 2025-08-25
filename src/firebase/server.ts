import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: App | null = null;

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const b64 = (process.env.FIREBASE_ADMIN_CERT_B64 || "")
    .replace(/[\r\n\s]/g, "")
    .replace(/^"|"$/g, "");

  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const sa = JSON.parse(json);
    return initializeApp({
      credential: cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      }),
    });
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
  const privateKey = raw.replace(/\\n/g, "\n");

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// Optional default makes debugging imports easier:
export default { adminApp, adminAuth, adminDb };