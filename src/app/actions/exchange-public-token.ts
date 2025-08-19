"use server";

import { plaidClient } from "@/lib/plaid";
import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { syncAllTransactions } from "./sync-all-transactions";

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

export async function exchangePublicToken(publicToken: string) {
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    try {
      const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
      const { access_token, item_id } = response.data;

      // Immediately trigger a historical pull. Webhook will handle future updates.
      const initialSync = await plaidClient.transactionsSync({ access_token, count: 100 });

      await getAdminDb().collection("users").doc(userId).collection("plaidItems").doc(item_id).set({
        accessToken: access_token,
        itemId: item_id,
        linkedAt: new Date().toISOString(),
        cursor: initialSync.data.next_cursor
      }, { merge: true });

       // Now, trigger the first transaction sync manually
      await syncAllTransactions();
  
      return { success: true, message: "Bank account linked successfully!" };

    } catch (error) {
      console.error("Error exchanging public token:", error);
      return { success: false, error: "Failed to link bank account." };
    }
}