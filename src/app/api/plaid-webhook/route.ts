
import { NextResponse, type NextRequest } from "next/server";
import { getAdminDb } from "@/firebase/server";
import { analyzeTransactions } from "@/ai/flows/analyze-transactions";
import { PlaidApi, PlaidEnvironments, Configuration } from "plaid";
import type { Transaction } from 'plaid';

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

async function findUserIdByItemId(itemId: string): Promise<string | null> {
    const db = getAdminDb();
    const plaidItemsCollectionGroup = db.collectionGroup('plaidItems');
    const querySnapshot = await plaidItemsCollectionGroup.where('itemId', '==', itemId).limit(1).get();

    if (querySnapshot.empty) {
        console.warn(`Could not find user for Plaid item ID: ${itemId}`);
        return null;
    }
    const userDocRef = querySnapshot.docs[0].ref.parent.parent;
    return userDocRef ? userDocRef.id : null;
}

async function triggerFinancialAnalysis(userId: string) {
    console.log(`Starting financial analysis for user: ${userId}`);
    const db = getAdminDb();
    
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    if (!userData) {
      console.log(`No user data found for ${userId}, skipping analysis.`);
      return;
    }

    const txSnap = await db.collection("users").doc(userId).collection("transactions").orderBy("date", "desc").limit(100).get();
    if (txSnap.empty) {
        console.log(`No transactions found for user ${userId}, skipping analysis.`);
        return;
    }
    
    const transactions = txSnap.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.name,
            amount: data.amount,
            date: data.date,
        };
    });

    try {
        const analysisResult = await analyzeTransactions({
            businessType: userData.businessType || "Freelancer",
            transactions: transactions,
        });

        await db.collection("users").doc(userId).collection("aiInsights").doc("latest").set({
            ...analysisResult,
            analyzedAt: new Date().toISOString(),
            transactionCount: transactions.length,
        });
        console.log(`Successfully stored AI insights for user: ${userId}`);
    } catch (error) {
        console.error(`AI analysis failed for user ${userId}:`, error);
    }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔔 Plaid Webhook Received:", JSON.stringify(body, null, 2));
    
    const { webhook_type, webhook_code, item_id } = body;

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
                await syncTransactionsForItem(userId, item_id, body.access_token);
                await triggerFinancialAnalysis(userId);
                break;
            case 'TRANSACTIONS_REMOVED':
                console.log(`Handling removed transactions for user ${userId}`);
                break;
        }
        break;
      case 'ITEM':
         switch(webhook_code) {
            case 'NEW_ACCOUNTS_AVAILABLE':
                console.log(`New accounts available for user ${userId}. You may want to re-fetch accounts.`);
                // You could also trigger a sync here if desired
                break;
            case 'WEBHOOK_UPDATE_ACKNOWLEDGED':
                console.log(`Webhook update acknowledged for item: ${item_id}`);
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

async function syncTransactionsForItem(userId: string, itemId: string, accessToken?: string) {
    const db = getAdminDb();
    const itemDocRef = db.collection("users").doc(userId).collection("plaidItems").doc(itemId);
    const itemDoc = await itemDocRef.get();
    
    if (!itemDoc.exists) {
        console.error(`Plaid item ${itemId} not found for user ${userId}.`);
        return;
    }

    const itemData = itemDoc.data();
    const token = accessToken || itemData?.accessToken;
    if (!token) {
        console.error(`No access token found for Plaid item ${itemId}.`);
        return;
    }

    let cursor = itemData?.cursor || null;

    let added: Transaction[] = [];
    let hasMore = true;

    while (hasMore) {
        const request: any = { access_token: token, cursor };
        const response = await plaidClient.transactionsSync(request);
        const data = response.data;

        added = added.concat(data.added);
        hasMore = data.has_more;
        cursor = data.next_cursor;
    }
    
    console.log(`Found ${added.length} new transactions to sync for user ${userId}`);

    if (added.length > 0) {
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
    }

    await itemDocRef.set({ cursor: cursor, lastSync: new Date().toISOString() }, { merge: true });
}
