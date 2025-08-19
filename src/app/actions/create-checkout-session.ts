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

export async function createCheckoutSession(items: { lookup_key: string, quantity?: number }[]) {
    try {
        const userId = await getUserId();
        const db = getAdminDb();
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();
        let customerId = userDoc.data()?.stripeCustomerId;

        // Create a new Stripe customer if one doesn't exist
        if (!customerId) {
            const firebaseUser = await getAdminAuth().getUser(userId);
            const customer = await stripe.customers.create({
                email: firebaseUser.email,
                metadata: { firebaseUID: userId }
            });
            customerId = customer.id;
            await userDocRef.set({ stripeCustomerId: customerId }, { merge: true });
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Provide items as [{ lookup_key, quantity? }]');
        }

        const lineItems = await Promise.all(items.map(async (item) => {
            if (!item.lookup_key) throw new Error('Each item needs a lookup_key');
            const prices = await stripe.prices.list({ lookup_keys: [item.lookup_key], active: true });
            const price = prices.data[0];
            if (!price) throw new Error(`Price not found for ${item.lookup_key}`);
            const lineItem: any = { price: price.id };
            if (item.quantity && price.recurring?.usage_type !== 'metered') {
                 lineItem.quantity = item.quantity;
            }
            return lineItem;
        }));
        
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: customerId,
            line_items: lineItems,
            automatic_tax: { enabled: true },
            customer_update: { address: 'auto' },
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=cancel`,
        });

        return { success: true, url: session.url };
    } catch (error) {
        console.error("Error creating checkout session:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}