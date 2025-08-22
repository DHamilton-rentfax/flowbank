// scripts/check-admin-creds.ts
const raw = process.env.FIREBASE_ADMIN_CERT_JSON;
if (!raw) throw new Error("Missing env");
const creds = JSON.parse(raw);
console.log("project_id:", creds.project_id);
console.log("private_key starts with:", String(creds.private_key).slice(0, 30));