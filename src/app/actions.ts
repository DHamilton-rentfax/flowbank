"use server";

import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { analyzeTransactions, type AnalyzeTransactionsInput, type AnalyzeTransactionsOutput } from "@/ai/flows/analyze-transactions";
import { suggestAllocationPlan } from "@/ai/flows/suggest-allocation-plan";
import { plaidClient } from "@/lib/plaid";
import { Products } from "plaid";
import { CountryCode } from "plaid";
import { syncAllTransactions as syncAllTransactionsForUser } from "./actions/sync-all-transactions";
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

export async function createPortalSession() {
    const userId = await getUserId();
    const db = getAdminDb();
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
        // This case should ideally not happen for an active user trying to manage billing.
        // But we handle it defensively.
        const firebaseUser = await getAdminAuth().getUser(userId);
        const customer = await stripe.customers.create({
            email: firebaseUser.email,
            metadata: { firebaseUID: userId }
        });
        customerId = customer.id;
        await userDocRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });
    return { success: true, url: portal.url };
}

export async function createLinkToken() {
    const userId = await getUserId();
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
      await syncAllTransactionsForUser();
  
      return { success: true, message: "Bank account linked successfully!" };

    } catch (error) {
      console.error("Error exchanging public token:", error);
      return { success: false, error: "Failed to link bank account." };
    }
}

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

    