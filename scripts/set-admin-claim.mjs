
#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config'; // To load .env.local

async function setAdminClaim() {
  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (!b64) {
    throw new Error('FIREBASE_ADMIN_CERT_B64 is missing from your environment. Please add it to .env.local');
  }

  const creds = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  
  initializeApp({
    credential: cert(creds),
  });

  // IMPORTANT: Replace this with the UID of the user you want to make an admin.
  // You can find a user's UID in the Firebase Authentication console.
  const uid = 'YOUR_FIREBASE_UID'; 

  if (uid === 'YOUR_FIREBASE_UID') {
    console.error("Please replace 'YOUR_FIREBASE_UID' with an actual user ID in scripts/set-admin-claim.mjs");
    return;
  }

  try {
    await getAuth().setCustomUserClaims(uid, { admin: true, role: 'admin' });
    console.log(`Successfully set admin claim for user: ${uid}`);
    console.log('You may need to log out and log back in for the changes to take effect.');
  } catch (error) {
    console.error('Error setting custom claim:', error);
  }
}

setAdminClaim();
