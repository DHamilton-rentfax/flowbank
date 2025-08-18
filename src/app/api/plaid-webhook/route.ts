
import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb } from "@/firebase/server";
import { syncAllTransactions } from "@/app/actions";
import { PlaidApi, PlaidEnvironments, Configuration } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV!],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// This is a simplified user lookup. In a real app, you might have a more direct
// mapping from item_id to user_id.
async function findUserIdByItemId(itemId: string): Promise<string | null> {
    const db = getAdminDb();
    const plaidItemsCollectionGroup = db.collectionGroup('plaidItems');
    const querySnapshot = await plaidItemsCollectionGroup.where('itemId', '==', itemId).limit(1).get();

    if (querySnapshot.empty) {
        console.warn(`Could not find user for Plaid item ID: ${itemId}`);
        return null;
    }
    // The path to the doc is users/{userId}/plaidItems/{itemId}
    const userDocRef = querySnapshot.docs[0].ref.parent.parent;
    return userDocRef ? userDocRef.id : null;
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔔 Plaid Webhook Received:", JSON.stringify(body, null, 2));
    
    const { webhook_type, webhook_code, item_id, new_transactions } = body;

    // In a production environment, you would want to verify the webhook signature here
    // using the `plaid-webhook-verification` header and your webhook secret.

    const userId = await findUserIdByItemId(item_id);

    if (!userId) {
        return NextResponse.json({ error: "User not found for this item." }, { status: 404 });
    }

    switch (webhook_type) {
      case 'TRANSACTIONS':
        switch(webhook_code) {
            case 'INITIAL_UPDATE':
            case 'HISTORICAL_UPDATE':
            case 'DEFAULT_UPDATE':
                console.log(`Syncing transactions for user ${userId} due to ${webhook_code}`);
                // We re-use the action logic here. We can't call the action directly
                // because we don't have the user's ID token, so we replicate the core logic.
                const itemsSnap = await getAdminDb().collection("users").doc(userId).collection("plaidItems").get();
                for (const itemDoc of itemsSnap.docs) {
                     await syncTransactionsForItem(userId, itemDoc.id, itemDoc.data().accessToken);
                }
                
                // Here you could trigger the AI financial analysis as a next step
                // await triggerFinancialAnalysis(userId);

                break;
            case 'TRANSACTIONS_REMOVED':
                // Handle removed transactions if necessary
                console.log(`Handling removed transactions for user ${userId}`);
                break;
        }
        break;
      case 'ITEM':
        switch(webhook_code) {
            case 'NEW_ACCOUNTS_AVAILABLE':
                console.log(`New accounts available for user ${userId}. You may want to re-fetch accounts.`);
                break;
            case 'ERROR':
                console.error(`Plaid item error for user ${userId}:`, body.error);
                break;
        }
        break;
      default:
        console.log(`Unhandled Plaid webhook type: ${webhook_type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Error processing Plaid webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: "Webhook processing failed.", details: errorMessage }, { status: 500 });
  }
}


// This logic is duplicated from actions.ts to be used server-side without an auth context
async function syncTransactionsForItem(userId: string, itemId: string, accessToken: string) {
    const db = getAdminDb();
    const itemDocRef = db.collection("users").doc(userId).collection("plaidItems").doc(itemId);
    const itemDoc = await itemDocRef.get();
    let cursor = itemDoc.data()?.cursor || null;

    let added: any[] = [];
    let hasMore = true;

    while (hasMore) {
        const request: any = { access_token: accessToken, cursor };
        const response = await plaidClient.transactionsSync(request);
        const data = response.data;

        added = added.concat(data.added);
        hasMore = data.has_more;
        cursor = data.next_cursor;
    }
    
    console.log(`Found ${added.length} new transactions to sync for user ${userId}`);

    const batch = db.batch();
    for (const tx of added) {
        const ref = db.collection("users").doc(userId).collection("transactions").doc(tx.transaction_id);
        const isIncome = !tx.amount || tx.amount < 0;
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
