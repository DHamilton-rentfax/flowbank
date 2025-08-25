import fs from 'fs';
const json = fs.readFileSync('service-account.json','utf8');
JSON.parse(json); // validate
const b64 = Buffer.from(json, 'utf8').toString('base64');
fs.writeFileSync('service-account.b64', b64);
console.log('✅ Wrote service-account.b64');
