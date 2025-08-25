import fs from 'fs';

const keyEscaped = fs.readFileSync('pem-escaped.txt','utf8').trim();

const obj = {
  type: "service_account",
  project_id: "flow-bank-app",
  private_key_id: "ef2a998d8be76a444583729dba286a98b4667e0b",
  private_key: keyEscaped,            // stays with 
  client_email: "firebase-adminsdk-fbsvc@flow-bank-app.iam.gserviceaccount.com",
  client_id: "108410899209471733159",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40flow-bank-app.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const json = JSON.stringify(obj, null, 2);
fs.writeFileSync('service-account.json', json);
console.log('✅ Wrote service-account.json');

const b64 = Buffer.from(json, 'utf8').toString('base64');
fs.writeFileSync('service-account.b64', b64);
console.log('✅ Wrote service-account.b64 (single line)');