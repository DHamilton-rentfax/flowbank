"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import type { AllocationRule } from "@/lib/types";

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

// Allocation Engine
async function allocateForUserTx(userId: string, tx: any) {
    const db = getAdminDb();
    const rulesSnap = await db.collection("users").doc(userId).collection("rules").get();
    const rules = rulesSnap.docs.map(d => ({ id: d.id, ...d.data() } as AllocationRule));
    if (!rules.length) return;

    const incomeAmount = Math.abs(tx.amount);
    const allocations: { ruleId: string; name: string; percentage: number; amount: number; destination: any }[] = [];
    let totalPercentage = 0;

    for (const rule of rules) {
        const percentage = Number(rule.percentage || 0);
        if (percentage > 0) {
            totalPercentage += percentage;
            const amount = Math.round((incomeAmount * (percentage / 100)) * 100) / 100;
            allocations.push({ ruleId: rule.id, name: rule.name, percentage, amount, destination: rule.destination });
        }
    }
    
    // Normalize if total > 100
    if (totalPercentage > 100) {
        const factor = 100 / totalPercentage;
        allocations.forEach(a => a.amount = Math.round((a.amount * factor) * 100) / 100);
    }

    const transfers: any[] = [];
    for (const alloc of allocations) {
        // In a real app, this would create Stripe transfers. For now, we simulate.
        transfers.push({
            ...alloc,
            transferId: `held_${Math.random().toString(36).slice(2, 10)}`
        });
    }

    await db.collection("users").doc(userId).collection("allocations").add({
        txId: tx.transaction_id || tx.id,
        executedAt: new Date().toISOString(),
        date: tx.date,
        currency: tx.iso_currency_code || 'USD',
        totalIncome: incomeAmount,
        outputs: transfers
    });

    // Update virtual account balances
    const batch = db.batch();
    for (const alloc of allocations) {
        const accountRef = db.collection("users").doc(userId).collection("accounts").doc(alloc.ruleId);
        const accountDoc = await accountRef.get();
        const currentBalance = accountDoc.exists ? accountDoc.data()!.balance : 0;
        batch.set(accountRef, {
            id: alloc.ruleId,
            name: alloc.name,
            balance: currentBalance + alloc.amount
        }, { merge: true });
    }
    await batch.commit();
}


export async function manualAllocate(txId: string) {
    const userId = await getUserId();
    const txDoc = await getAdminDb().collection("users").doc(userId).collection("transactions").doc(txId).get();
    if (!txDoc.exists) throw new Error("Transaction not found");
    await allocateForUserTx(userId, txDoc.data());
    return { success: true };
}