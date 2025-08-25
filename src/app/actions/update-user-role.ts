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

export async function updateUserRole(targetUid: string, newRole: 'admin' | 'user' | 'member') {
    const currentUserId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    try {
        // 1. Verify that the current user is an admin
        const currentUserClaims = (await auth.getUser(currentUserId)).customClaims;
        if (currentUserClaims?.role !== 'admin') {
            throw new Error("You do not have permission to change user roles.");
        }

        // 2. Fetch the target user to prevent self-modification or modifying the root admin
        const targetUser = await auth.getUser(targetUid);
        if (targetUser.uid === currentUserId) {
            throw new Error("Admins cannot change their own role.");
        }
        if (targetUser.email === process.env.NEXT_PUBLIC_ROOT_ADMIN_EMAIL) {
             throw new Error("The root admin's role cannot be changed.");
        }

        // 3. Update Custom Claims (for backend access control)
        await auth.setCustomUserClaims(targetUid, { ...targetUser.customClaims, role: newRole });

        // 4. Update Firestore (for UI display and client-side logic)
        await db.collection('users').doc(targetUid).set({
            role: newRole
        }, { merge: true });

        return { success: true, message: `Successfully updated ${targetUser.email || targetUid} to ${newRole}.` };

    } catch (error) {
        console.error("Error updating user role:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}