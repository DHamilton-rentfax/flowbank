import fs from 'fs';
import { Buffer } from 'buffer';


const path = './service-account.json';
if (!fs.existsSync(path)) {
  console.error('❌ service-account.json not found in current directory.');
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1) Produce a perfect .env line for discrete envs
const escaped = json.private_key.replace(/\n/g, '\\n');
console.log('──────── .env line (discrete) ────────');
console.log(`FIREBASE_ADMIN_PRIVATE_KEY="${escaped}"`);
console.log('───────────────────────────────────────\n');

// 2) Also write a file with the actual PEM so you can eyeball it
fs.writeFileSync('./temp-private-key.pem', json.private_key);
console.log('📝 Wrote ./temp-private-key.pem (do not commit this file).');

// 3) Also generate a base64 of the whole JSON (bomb-proof env)
const b64 = Buffer.from(JSON.stringify(json)).toString('base64');
fs.writeFileSync('./service-account.b64', b64);
console.log('🧰 Wrote ./service-account.b64 (single line, for FIREBASE_ADMIN_CERT_B64).');
