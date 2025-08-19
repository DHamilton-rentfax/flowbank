
"use server";

import { stripe } from "@/lib/stripe";
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

export async function createPortalSession() {
    const userId = await getUserId();
    const db = getAdminDb();
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
        // This case should ideally not happen for an active user trying to manage billing.
        // But we handle it defensively.
        const firebaseUser = await getAdminAuth().getUser(userId);
        const customer = await stripe.customers.create({
            email: firebaseUser.email,
            metadata: { firebaseUID: userId }
        });
        customerId = customer.id;
        await userDocRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });
    return { success: true, url: portal.url };
}

    