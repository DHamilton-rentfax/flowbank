// check-admin.mjs (ESM)
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function tryLoadEnv() {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
  ];

  let loaded = false;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      console.log(`📄 Loaded env file: ${p}`);
      loaded = true;
      break;
    }
  }
  if (!loaded) {
    console.log("⚠️ No .env.local or .env found; using process.env only.");
  }
}

function pick(...vals) {
  return vals.find((v) => !!v);
}

function getFromB64() {
  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (!b64) return null;
  try {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const obj = JSON.parse(json);
    return {
      projectId: obj.project_id,
      clientEmail: obj.client_email,
      privateKey: obj.private_key,
    };
  } catch (e) {
    throw new Error("FIREBASE_ADMIN_CERT_B64 is not valid base64 JSON");
  }
}

function showSeenEnv() {
  const seen = Object.keys(process.env).filter((k) => k.startsWith("FIREBASE_ADMIN_"));
  console.log("🔎 Detected FIREBASE_ADMIN_* envs:", seen.length ? seen.join(", ") : "(none)");
}

try {
  tryLoadEnv();
  showSeenEnv();

  const fromJson = getFromB64();

  const projectId = pick(
    process.env.FIREBASE_ADMIN_PROJECT_ID,
    process.env.GOOGLE_CLOUD_PROJECT,
    fromJson?.projectId
  );
  const clientEmail = pick(
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    fromJson?.clientEmail
  );
  const rawKey = pick(
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    process.env.FIREBASE_PRIVATE_KEY,
    fromJson?.privateKey
  );

  if (!projectId) throw new Error("Missing FIREBASE_ADMIN_PROJECT_ID (or GOOGLE_CLOUD_PROJECT / FIREBASE_ADMIN_CERT_B64)");
  if (!clientEmail) throw new Error("Missing FIREBASE_ADMIN_CLIENT_EMAIL (or FIREBASE_ADMIN_CERT_B64)");
  if (!rawKey) throw new Error("Missing FIREBASE_ADMIN_PRIVATE_KEY (or FIREBASE_PRIVATE_KEY / FIREBASE_ADMIN_CERT_B64)");

  console.log("📦 Loaded values:");
  console.log("  FIREBASE_ADMIN_PROJECT_ID:", projectId);
  console.log("  FIREBASE_ADMIN_CLIENT_EMAIL:", clientEmail);
  console.log("  PRIVATE_KEY (first 60 chars):", rawKey.slice(0, 60) + "...");

  const privateKey = rawKey.replace(/\\n/g, "\n");

  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error('PEM markers missing. Ensure the key is quoted and uses "\\n" in env files.');
  }
  console.log("✅ PEM markers detected.");

  // Optional: write for eyeballing (DON'T COMMIT)
  fs.writeFileSync("./temp-private-key.pem", privateKey);
  console.log("📝 Wrote ./temp-private-key.pem (delete after checking).");

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

  console.log("🔐 Verifying Admin access with auth.listUsers(1)...");
  const result = await getAuth(app).listUsers(1);
  console.log(`✅ Firebase Admin initialized. listUsers returned ${result.users?.length ?? 0} user(s).`);
  console.log("🎉 All good.");
  process.exit(0);
} catch (err) {
  console.error("❌ Check failed:", err?.message || err);
  console.error(`
Fixes:
1) Put these in your env file (prefer .env.local at project root):
   FIREBASE_ADMIN_PROJECT_ID=flow-bank-app
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@flow-bank-app.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
   (or FIREBASE_ADMIN_CERT_B64 with base64 of the whole JSON)
2) Make sure you're running from the project root:  pwd  => should show the folder with .env.local
3) If listUsers fails with PERMISSION_DENIED, grant the service account "Firebase Authentication Admin".
`);
  process.exit(1);
}
