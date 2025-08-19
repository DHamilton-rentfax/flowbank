
"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { plaidClient } from "@/lib/plaid";
import { TransactionsSyncRequest } from "plaid";

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

// Plaid: Sync Transactions
async function syncTransactionsForItem(userId: string, itemId: string, accessToken: string) {
    const db = getAdminDb();
    const itemDocRef = db.collection("users").doc(userId).collection("plaidItems").doc(itemId);
    const itemDoc = await itemDocRef.get();
    let cursor = itemDoc.data()?.cursor || null;

    let added: any[] = [];
    let hasMore = true;

    while (hasMore) {
        const request: TransactionsSyncRequest = { access_token: accessToken, cursor };
        const response = await plaidClient.transactionsSync(request);
        const data = response.data;

        added = added.concat(data.added);
        hasMore = data.has_more;
        cursor = data.next_cursor;
    }

    const batch = db.batch();
    for (const tx of added) {
        const ref = db.collection("users").doc(userId).collection("transactions").doc(tx.transaction_id);
        const isIncome = !tx.amount || tx.amount < 0; // In Plaid, positive amounts are debits, negative are credits (income)
        batch.set(ref, {
            ...tx,
            isIncome: isIncome,
            syncedAt: new Date().toISOString(),
            itemId: itemId
        }, { merge: true });
    }
    await batch.commit();

    await itemDocRef.set({ cursor: cursor, lastSync: new Date().toISOString() }, { merge: true });
}

export async function syncAllTransactions() {
    const userId = await getUserId();
    const itemsSnap = await getAdminDb().collection("users").doc(userId).collection("plaidItems").get();
    for (const itemDoc of itemsSnap.docs) {
        await syncTransactionsForItem(userId, itemDoc.id, itemDoc.data().accessToken);
    }
    return { success: true };
}

    