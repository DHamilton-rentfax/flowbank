
"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";

// Helper to get the current user's UID from the session
const getUserId = async () => {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        throw new Error("User not authenticated");
    }
    try {
        const decodedToken = await getAdminAuth().verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying ID token:", error);
        throw new Error("Invalid authentication token.");
    }
};

export async function saveCronConfig(cron: string, enabled: boolean) {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access this action.");
    }

    const cronRef = doc(db, "config", "cron");
    await setDoc(cronRef, { campaignDigest: cron, enabled: enabled }, { merge: true });

    await addDoc(collection(db, "logs"), {
        type: "cron_config_updated",
        actor: currentUserClaims.email,
        message: `Updated campaign digest cron to: ${cron} (Enabled: ${enabled})`,
        timestamp: new Date().toISOString()
    });
    
    return { success: true, message: "Cron configuration saved." };
}

    