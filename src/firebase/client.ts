
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "autoallocator",
  appId: "1:280963293966:web:878190c5bfae3d00e7ad5f",
  storageBucket: "autoallocator.firebasestorage.app",
  apiKey: "AIzaSyC9BfxPjqxsL96Op0MhV2IidqNynSvdjjg",
  authDomain: "autoallocator.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "280963293966",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
