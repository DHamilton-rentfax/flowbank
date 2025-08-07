
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;

function initializeFirebase(config: any) {
    if (!getApps().length) {
        app = initializeApp(config);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
}


export { initializeFirebase, app, auth, db };
