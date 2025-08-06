
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
    if (getApps().length > 0) {
        return getApp();
    }
    
    // Check if all required config keys are present
    const requiredKeys: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId'];
    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

    if (missingKeys.length > 0) {
        console.error(`Firebase config is missing required keys: ${missingKeys.join(', ')}`);
        // Return a dummy object or handle this case appropriately
        // to avoid crashing the app if the config isn't ready.
        return null;
    }

    return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

// Initialize services only if the app was successfully initialized
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;


export { app, auth, db };
