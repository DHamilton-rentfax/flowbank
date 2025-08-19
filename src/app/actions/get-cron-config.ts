"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { doc, getDoc } from "firebase/firestore";

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

export async function getCronConfig() {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access this action.");
    }
    
    const cronRef = doc(db, "config", "cron");
    const snap = await getDoc(cronRef);
    if (!snap.exists()) {
        return { cron: "0 9 * * *", enabled: true };
    }
    const data = snap.data();
    return { cron: data?.campaignDigest || "0 9 * * *", enabled: data?.enabled ?? true };
}