"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import type { UserData } from "@/lib/types";

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

export async function getAiCampaignTargets() {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access admin actions.");
    }

    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData & { id: string }));

    // Filter for users on a paid plan (e.g., 'pro') who haven't used the AI feature
    const targets = users.filter(user => 
        (user.plan?.id === 'pro' || user.plan?.id === 'starter') &&
        !user.features?.aiTaxCoach
    ).map(user => ({ email: user.email, plan: user.plan?.id, aiUsed: false }));

    return { targets };
}