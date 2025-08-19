"use server";

import { stripe } from "@/lib/stripe";
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

export async function getAdminAnalytics() {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access admin analytics.");
    }
    
    // Fetch all users
    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map(doc => doc.data() as UserData);

    const totalUsers = users.length;
    
    // Calculate plan breakdown
    const planCounts = users.reduce((acc, user) => {
        const planId = user.plan?.id || 'free';
        acc[planId] = (acc[planId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Fetch all active subscriptions from Stripe to calculate MRR
    let mrr = 0;
    const subscriptions = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    
    for (const sub of subscriptions.data) {
        const monthlyPrice = sub.items.data.reduce((total, item) => {
            if (item.price.recurring?.interval === 'month') {
                return total + (item.price.unit_amount || 0);
            }
            if (item.price.recurring?.interval === 'year') {
                return total + ((item.price.unit_amount || 0) / 12);
            }
            return total;
        }, 0);
        mrr += monthlyPrice;
    }
    mrr = Math.round(mrr / 100); // Convert from cents

    const recentUsers = users.slice(0, 5).map(u => ({ email: u.email, plan: u.plan?.id || 'free' }));
    
    return {
        totalUsers,
        planCounts,
        mrr,
        recentUsers,
    };
}