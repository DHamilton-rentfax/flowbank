
"use server";

import { analyzeTransactions, type AnalyzeTransactionsInput, type AnalyzeTransactionsOutput } from "@/ai/flows/analyze-transactions";
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

export async function getAIFinancialAnalysis(input: AnalyzeTransactionsInput): Promise<AnalyzeTransactionsOutput> {
    const userId = await getUserId();
    const db = getAdminDb();
    try {
        const result = await analyzeTransactions(input);
        await db.collection("users").doc(userId).collection("aiInsights").doc("latest").set({
            ...result,
            analyzedAt: new Date().toISOString(),
            transactionCount: input.transactions.length,
        }, { merge: true });
        return result;
    } catch (error) {
        console.error('Error getting AI financial analysis:', error);
        throw error;
    }
}

    