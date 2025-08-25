import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

let b64 = process.env.FIREBASE_ADMIN_CERT_B64 || "";
b64 = b64.replace(/[\r\n\s]/g, "").replace(/^"|"$/g, "");
if (!b64) { console.error('❌ FIREBASE_ADMIN_CERT_B64 is empty.'); process.exit(1); }

let decoded;
try {
  decoded = Buffer.from(b64, 'base64').toString('utf8');
} catch (e) {
  console.error('❌ Base64 decode failed:', e.message);
  process.exit(1);
}

console.log('🔎 First 120 chars of decoded text:\n', decoded.slice(0, 120));
try {
  const obj = JSON.parse(decoded);
  console.log('✅ Decoded JSON is valid. project_id:', obj.project_id, ' client_email:', obj.client_email);
} catch (e) {
  console.error('❌ Decoded text is not valid JSON:', e.message);
}