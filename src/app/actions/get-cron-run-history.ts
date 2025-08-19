"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import type { CronRun } from "@/lib/types";

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

export async function getCronRunHistory() {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access this action.");
    }

    const ref = collection(db, "cron_runs");
    const q = query(ref, orderBy("runAt", "desc"), limit(100));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CronRun));
    return { runs: data };
}