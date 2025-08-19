
"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";

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

export async function getAllUsers() {
    const currentUserId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify that the current user is an admin
    const currentUserClaims = (await auth.getUser(currentUserId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to view users.");
    }
    
    const usersSnap = await db.collection('users').orderBy('email').get();
    const users = usersSnap.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email || 'N/A',
            role: data.role || 'user',
            plan: data.plan?.id || 'free',
        };
    });
    
    return { users };
}

    