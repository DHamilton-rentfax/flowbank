
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

export async function getAnalyticsSnapshot(sinceDate: string | null) {
    if (!process.env.FIREBASE_PRIVATE_KEY) {
        console.warn("Firebase Admin SDK not configured. Skipping server-side analytics.");
        return { since: null, income: 0, expenses: 0, net: 0, series: [] };
    }
    const userId = await getUserId();
    const db = getAdminDb();
    const since = sinceDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const txSnap = await db.collection("users").doc(userId).collection("transactions")
        .where("date", ">=", since)
        .get();

    let income = 0, expenses = 0;
    const byDay: { [key: string]: { income: number, expenses: number } } = {};

    txSnap.forEach(doc => {
        const tx = doc.data();
        const date = tx.date;
        const amount = Number(tx.amount || 0);

        if (!byDay[date]) byDay[date] = { income: 0, expenses: 0 };

        if (amount < 0) { // Plaid income is negative
            income += Math.abs(amount);
            byDay[date].income += Math.abs(amount);
        } else {
            expenses += amount;
            byDay[date].expenses += amount;
        }
    });

    const series = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v }));
    const round2 = (n: number) => Math.round(n * 100) / 100;
    
    const snapshot = {
        since,
        income: round2(income),
        expenses: round2(expenses),
        net: round2(income - expenses),
        series,
    };

    await db.collection("users").doc(userId).collection("analytics").doc("latest").set(snapshot, { merge: true });
    return snapshot;
}

    