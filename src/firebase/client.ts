
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyC9BfxPjqxsL96Op0MhV2IidqNynSvdjjg",
  authDomain: "autoallocator.firebaseapp.com",
  projectId: "autoallocator",
  storageBucket: "autoallocator.appspot.com",
  messagingSenderId: "280963293966",
  appId: "1:280963293966:web:878190c5bfae3d00e7ad5f",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
