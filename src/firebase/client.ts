
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzJuxDWtnLYrBVz6VwN_VcIdRyBhHz8uY",
  authDomain: "flow-bank-app.firebaseapp.com",
  projectId: "flow-bank-app",
  storageBucket: "flow-bank-app.appspot.com",
  messagingSenderId: "192553978727",
  appId: "1:192553978727:web:8a97d6b6c01d5d919a3dc2",
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
