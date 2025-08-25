import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createPrivateKey } from "crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

let raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (!raw) {
  console.error("❌ FIREBASE_ADMIN_PRIVATE_KEY not set.");
  process.exit(1);
}

// 1) Normalize common issues
let key = raw
  .toString()
  .trim()
  .replace(/^"+|"+$/g, "")              // strip wrapping quotes if env loader kept them
  .replace(/\n/g, "\n")                // turn literal \n into real newlines
  .replace(/\r/g, "")                   // normalize CRLF → LF
  .replace(/\\s*$/gm, "");             // remove stray backslashes at end of lines

// 2) Write what we'll actually use (so you can eyeball it)
fs.writeFileSync("./_normalized.pem", key);

// 3) Cryptographic parse check (will throw if invalid)
try {
  createPrivateKey({ key, format: "pem", type: "pkcs8" });
  console.log("✅ PEM parses with Node crypto.");
} catch (e) {
  console.error("❌ Node crypto rejected the PEM:", e.message);
  console.error("   Open _normalized.pem and inspect the first 3 lines.");
  process.exit(1);
}

// 4) Initialize Firebase Admin with the normalized key
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
if (!projectId || !clientEmail) {
  console.error("❌ Missing FIREBASE_ADMIN_PROJECT_ID or FIREBASE_ADMIN_CLIENT_EMAIL.");
  process.exit(1);
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert({ projectId, clientEmail, privateKey: key }) });

try {
  const res = await getAuth(app).listUsers(1);
  console.log(`✅ Firebase Admin initialized. listUsers returned ${res.users?.length ?? 0} user(s).`);
} catch (e) {
  console.error("❌ Firebase Admin init/listUsers failed:", e.message);
  process.exit(1);
}