import fs from 'fs';

const path = './service-account.json';
if (!fs.existsSync(path)) {
  console.error('❌ service-account.json not found in current directory.');
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(path, 'utf8'));

const privateKey = json.private_key;
const escapedKey = privateKey.split('\n').join('\\n');

console.log(`FIREBASE_ADMIN_PRIVATE_KEY="${escapedKey}"`);