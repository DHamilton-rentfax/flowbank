
"use server";

import { suggestAllocationPlan, type SuggestAllocationPlanInput } from "@/ai/flows/suggest-allocation-plan";
import { plaidClient } from "@/lib/plaid";
import { Products, TransactionsSyncRequest } from "plaid";
import { CountryCode } from "plaid";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { plans, addOns } from "@/lib/plans";
import type { Account, UserPlan, UserData, PaymentLink, AllocationRule, Transaction } from "@/lib/types";

// Helper to get the current user's UID from the session
const getUserId = async () => {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        throw new Error("User not authenticated");
    }
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    return decodedToken.uid;
};

// Plaid: Create Link Token
export async function createLinkToken(idToken: string) {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    if (!userId) throw new Error("User not authenticated");

    try {
        const tokenRequest: any = {
          user: {
            client_user_id: userId,
          },
          client_name: 'FlowBank',
          country_codes: [CountryCode.Us],
          language: 'en',
          webhook: `${process.env.NEXT_PUBLIC_SITE_URL}/api/plaid-webhook`,
          products: [Products.Transactions],
        };
        
        const response = await plaidClient.linkTokenCreate(tokenRequest);
    
        return {
            success: true,
            linkToken: response.data.link_token
        };
      } catch (error) {
        console.error("Error creating Plaid link token:", error);
        return { success: false, error: "Failed to create Plaid link token." };
      }
}

// Plaid: Exchange Public Token
export async function exchangePublicToken(publicToken: string) {
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    try {
      const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
      const { access_token, item_id } = response.data;

      await getAdminDb().collection("users").doc(userId).collection("plaidItems").doc(item_id).set({
        accessToken: access_token,
        itemId: item_id,
        linkedAt: new Date().toISOString(),
      }, { merge: true });
  
      return { success: true, message: "Bank account linked successfully!" };

    } catch (error) {
      console.error("Error exchanging public token:", error);
      return { success: false, error: "Failed to link bank account." };
    }
}


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
    
    // Normalize if total > 100%
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
        const currentBalance = accountDoc.exists() ? accountDoc.data()!.balance : 0;
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

// Stripe Billing
export async function createCheckoutSession(planId: string) {
    const userId = await getUserId();
    const db = getAdminDb();
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
        const customer = await stripe.customers.create({ metadata: { firebaseUID: userId } });
        customerId = customer.id;
        await userDocRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    const plan = [...plans, ...addOns].find(p => p.id === planId);
    if (!plan || !plan.stripePriceId) throw new Error("Plan not found or not configured for Stripe.");

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=cancel`,
    });

    return { success: true, url: session.url };
}

export async function createPortalSession() {
    const userId = await getUserId();
    const userDoc = await getAdminDb().collection("users").doc(userId).get();
    const customerId = userDoc.data()?.stripeCustomerId;
    if (!customerId) throw new Error("Stripe customer not found.");

    const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });
    return { success: true, url: portal.url };
}

// Analytics
export async function getAnalyticsSnapshot(idToken: string | null, sinceDate: string | null) {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken!);
    const userId = decodedToken.uid;
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

// AI Suggestions
export async function getAISuggestion(businessType: string) {
    try {
      const result = await suggestAllocationPlan({ businessType });
      return {
        success: true,
        plan: result.allocationPlan,
        explanation: result.breakdownExplanation,
      };
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, error: errorMessage };
    }
}
