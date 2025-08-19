"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { getDocs, collection } from "firebase/firestore";
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

export async function exportCampaignData() {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access admin actions.");
    }

    const campaignsSnap = await getDocs(collection(db, "campaigns"));
    const campaigns = campaignsSnap.docs.map(d => d.data());
    
    const usersSnap = await getDocs(collection(db, "users"));
    const usersByEmail = usersSnap.docs.reduce((acc, doc) => {
        const data = doc.data();
        if (data.email) {
            acc[data.email] = data;
        }
        return acc;
    }, {} as { [email: string]: UserData });

    const rows = campaigns.map(campaign => {
        const user = usersByEmail[campaign.email];
        return {
            Email: campaign.email,
            Offer: campaign.offer,
            SentAt: campaign.sentAt,
            Type: campaign.type,
            Activated: user?.features?.aiTaxCoach ? "Yes" : "No",
            ActivatedAt: user?.aiTrialActivatedAt || "",
            Plan: user?.plan?.id || 'N/A'
        };
    });

    if (rows.length === 0) {
        return "";
    }

    const header = Object.keys(rows[0]).join(",");
    const body = rows.map(row => Object.values(row).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
    
    return `${header}\n${body}`;
}