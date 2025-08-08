
// src/firebase/server.ts
// Server-only Firebase Admin helpers. Never import this from a "use client" file.
import 'server-only';
import { initializeApp, getApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

const serviceAccount = {
  "type": "service_account",
  "project_id": "flow-bank-v2",
  "private_key_id": "358da3b4f16db53af97ab32653908a70c66fc1b8",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCbRo/eNRYPnfav\nap+QXADOC01lz+liIavVgbZa1L+1bmEXB1XtrOdNuP1g9wxJfyDeJxMaXbSkakEC\nonrkuyNSbh9x//u+nd5XMYuODHRmAa93ZQJw/Axd76pu9b+iTlik7XhUoxhoAPz+\nyv/BLgk2PkylLJ62PONOtQigJ5QfWqc8G3jcGVFJcE/GNwLidqvVB1XlvfzGDnkP\nQph90whI3HYIhY/+d0s1QVhZPGFw8Zjp6hzqUHG9ozByKodN5/rSI+tztCHSdVBS\n3jx3ELsz8ncIasz30kjlxLe6fajRsnsUJLQApbhDm+370Z9CM1obrccY0MPbaxqj\nT9Lk78IfAgMBAAECggEAIEDG74QdYf8Q150RKd5CeIoWeJh4RN7zn3TDGRjp/VjB\nKBRo/+aTYSyUzQhj7/xNKnf5WteuBxzfBhoT5uEMVDn1pCtk8lI+deQftdDWeL3O\n4cEEgc2JEBYRU90OAju94/xDq2j5T9kstAwcldbnKPJF32VmTjpViOrHsOSnut85\nq+3WX/8oqKdg367KUw4eFSXo0bW8mwYr8bguOJ8pU0SoIhU9tsLqBlXtncvAAoVZ\nkxzxqGlUfPsySq4YrrBKf2dih4+kmaLFX12N7yKUcBgwDyEr6tGZRJjPLIOHgSdV\n9clart2LvpuZ9hcWsLXMepuKKZqzpsC1y046UzxweQKBgQDVOCwuuaBkucnOvAu4\nfBbXot54DIeibNWT/1RJ7z4Q9dqnGGcb3P5v65ZG2MGqgm+CGyyw2/IoUKCqovPS\nyThOFv9pfGqhbqSpAUxoINMSkBCGXY5fSjqACABbtmJ6jH+sm8H0jx0HROoXAOnj\nISFq3BI9WFITuCJc59XRgpUnCwKBgQC6bihgpeTzG+bKUuWAydjvHtiy+p6MbqVd\npT6gYjZgC1blW+yVyurI31eveUUahVJqS6fMzdPvrguelCNdwObw1OiOjELvc0Qo\nOmcPWsNpcNnx4kID4NQOB4hfwJS9T7HpPz+hB+FKq8ZFTJ1Jrq974zctW4fI/X86\ntrfmw/8tvQKBgQCdVDOVzrbBXC3C9BKZ8EZSmwUZA/XZLgFykQa6/2OG1EKg5Wq/\nrpO4NdfPMwXEMTbig/a4EbNfeA71mgPb10pKpMGWLo3nzGKHqkOc2gulONRYsRPq\n0DTWYBETm0KTNrTGwq+dKzS6Nmmcy7nJNJsZ5IU46sC1eDsy3oZxb69q/QKBgQCD\nHmjdmK/O4CfQ0r7BdrVRcIN+Vc/e+w7pLwg96vVNVYxXIfDiZWX9wz87lfIpNe2B\n/xXUcEsH/oQDkzLQhJSoe0XYxANrv8kG9hR38yEO7qUKf1Rov97Ewz2CAsNZ5kw9\nvRM2YYFtcCSxprHVGbwoSOUMzJxSmx+5nrr23ZCCjQKBgA07BXQv6VqqnQmh1MhH\nJsCzOpYRTgsN/oAip4pVDCA6yZNDfJDzqc0wxLNiR3uDVrJTt/JajTRfD+rRlDnR\nwVQNm8Lg4B/iH8w/v03UNFmma7VN28yCQm0lCQV0uzmqMv8ORaO12wca+8CZ9sx+\nJ8a0OYt94hJm00RFMxO7vGJ0\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@flow-bank-v2.iam.gserviceaccount.com",
  "client_id": "112562820749931919441",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/o/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40flow-bank-v2.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

function makeApp(): App {
  // Try to use hardcoded credentials first (for local dev)
  try {
    return initializeApp({ credential: cert(serviceAccount) });
  } catch (e) {
    console.warn("[admin] Failed to initialize with hardcoded credentials. Falling back to ADC.", e);
    // If that fails, fall back to Application Default Credentials (for production)
    return initializeApp();
  }
}

export function getAdminApp(): App {
  if (_app) return _app;
  _app = getApps().length ? getApp() : makeApp();
  return _app!;
}

export function getAdminDb(): Firestore {
  return (_db ||= getFirestore(getAdminApp()));
}

export function getAdminAuth(): Auth {
  return (_auth ||= getAuth(getAdminApp()));
}
