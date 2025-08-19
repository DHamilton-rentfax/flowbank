
"use server";

import { suggestAllocationPlan, type SuggestAllocationPlanInput } from "@/ai/flows/suggest-allocation-plan";
import { analyzeTransactions, type AnalyzeTransactionsInput, type AnalyzeTransactionsOutput } from "@/ai/flows/analyze-transactions";
import { plaidClient } from "@/lib/plaid";
import { Products, TransactionsSyncRequest } from "plaid";
import { CountryCode } from "plaid";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { plans, addOns } from "@/lib/plans";
import type { Account, UserPlan, UserData, PaymentLink, AllocationRule, Transaction } from "@/lib/types";
import { Resend } from 'resend';
import { doc, setDoc, getDoc, getDocs, collection, addDoc, FieldValue } from "firebase/firestore";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const resend = new Resend(process.env.RESEND_API_KEY);

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

// Plaid: Create Link Token
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

// Plaid: Exchange Public Token
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

// Stripe Billing
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

// Analytics
export async function getAnalyticsSnapshot(sinceDate: string | null) {
    if (!process.env.FIREBASE_ADMIN_CERT_B64) {
        console.warn("FIREBASE_ADMIN_CERT_B64 not set. Skipping server-side analytics.");
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

// AI Functions
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


// Admin Actions
export async function grantHighestTierPlan(email: string) {
    // This is an admin-only function. In a real app, you'd protect this.
    // For now, we assume it's called from a trusted environment.
    const auth = getAdminAuth();
    const db = getAdminDb();

    try {
        const user = await auth.getUserByEmail(email);
        const proPlan = plans.find(p => p.id === 'pro');
        if (!proPlan) throw new Error("Pro plan not found in configuration.");

        const userPlan: UserPlan = {
            id: proPlan.id,
            name: proPlan.name,
        };

        // Set in Firestore
        await db.collection("users").doc(user.uid).set({ plan: userPlan }, { merge: true });

        // Set custom claims
        await auth.setCustomUserClaims(user.uid, { plan: proPlan.id, role: 'user' });

        return { success: true, message: `Successfully upgraded ${email} to the ${proPlan.name} plan.` };
    } catch (error) {
        console.error("Error granting plan:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

export async function updateUserRole(targetUid: string, newRole: 'admin' | 'user') {
    const currentUserId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    try {
        // 1. Verify that the current user is an admin
        const currentUserClaims = (await auth.getUser(currentUserId)).customClaims;
        if (currentUserClaims?.role !== 'admin') {
            throw new Error("You do not have permission to change user roles.");
        }

        // 2. Fetch the target user to prevent self-modification or modifying the root admin
        const targetUser = await auth.getUser(targetUid);
        if (targetUser.uid === currentUserId) {
            throw new Error("Admins cannot change their own role.");
        }
        if (targetUser.email === process.env.NEXT_PUBLIC_ROOT_ADMIN_EMAIL) {
             throw new Error("The root admin's role cannot be changed.");
        }

        // 3. Update Custom Claims (for backend access control)
        await auth.setCustomUserClaims(targetUid, { role: newRole });

        // 4. Update Firestore (for UI display and client-side logic)
        await db.collection('users').doc(targetUid).set({ 
            role: newRole 
        }, { merge: true });

        return { success: true, message: `Successfully updated ${targetUser.email || targetUid} to ${newRole}.` };

    } catch (error) {
        console.error("Error updating user role:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

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
    
export async function getAiCampaignTargets() {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access admin actions.");
    }

    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData & { id: string }));

    // Filter for users on a paid plan (e.g., 'pro') who haven't used the AI feature
    const targets = users.filter(user => 
        (user.plan?.id === 'pro' || user.plan?.id === 'starter') &&
        !user.features?.aiTaxCoach
    ).map(user => ({ email: user.email, plan: user.plan?.id, aiUsed: false }));

    return { targets };
}

export async function sendAiTrialInvite(email: string) {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
      throw new Error("You do not have permission to access admin actions.");
    }

    try {
        await resend.emails.send({
          from: "FlowBank <support@flowbank.ai>",
          to: email,
          subject: "🎁 Enjoy 7 Days of AI Financial Coaching on Us",
          html: `
            <div style="font-family: sans-serif; padding: 20px">
              <h2>Hello from FlowBank 👋</h2>
              <p>We noticed you're on a paid plan but haven't explored our AI Financial Advisor yet.</p>
              <p><strong>We'd love to give you a 7-day free trial of our AI-powered coaching and insights — starting now.</strong></p>
              <p>No credit card required, just click below to activate it:</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background:#4A90E2;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Activate Free Trial</a></p>
              <p>If you have any questions, just reply to this email. Cheers!</p>
              <br />
              <p>– The FlowBank Team</p>
            </div>
          `
        });
    
        await db.collection("campaigns").doc(email).set({
          offer: "7-day AI trial",
          email,
          sentAt: new Date().toISOString(),
          type: "ai_trial_invite"
        }, { merge: true });
    
        return { success: true, message: `Trial invite sent to ${email}.` };

      } catch (error) {
        console.error("Failed to send AI trial email:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: errorMessage };
    }
}

export async function exportCampaignData() {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access admin actions.");
    }

    const campaignsSnap = await getDocs(collection(db, "campaigns"));
    const campaigns = campaignsSnap.docs.map(d => d.data());
    
    const usersSnap = await getDocs(collection(db, "users"));
    const usersByEmail = usersSnap.docs.reduce((acc, doc) => {
        const data = doc.data();
        if (data.email) {
            acc[data.email] = data;
        }
        return acc;
    }, {} as { [email: string]: UserData });

    const rows = campaigns.map(campaign => {
        const user = usersByEmail[campaign.email];
        return {
            Email: campaign.email,
            Offer: campaign.offer,
            SentAt: campaign.sentAt,
            Type: campaign.type,
            Activated: user?.features?.aiTaxCoach ? "Yes" : "No",
            ActivatedAt: user?.aiTrialActivatedAt || "",
            Plan: user?.plan?.id || 'N/A'
        };
    });

    if (rows.length === 0) {
        return "";
    }

    const header = Object.keys(rows[0]).join(",");
    const body = rows.map(row => Object.values(row).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
    
    return `${header}\n${body}`;
}

async function generateCampaignSummaryPDF(data: any[]) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
  
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const draw = (text: string, y: number) => page.drawText(text, { x: 40, y, size: 12, font, color: rgb(0, 0, 0) });
  
    draw("FlowBank – AI Trial Campaign Summary", height - 50);
    draw(`Generated: ${new Date().toLocaleString()}`, height - 70);
  
    let y = height - 110;
    for (let i = 0; i < data.length && y > 60; i++) {
      const row = data[i];
      draw(`${i + 1}. ${row.Email} | ${row.Activated} | Sent: ${new Date(row.SentAt).toLocaleDateString()}`, y);
      y -= 20;
    }
  
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

export async function sendCampaignDigest() {
    const userId = await getUserId();
    const auth = getAdminAuth();
     const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access this action.");
    }
    
    // Fetch data
    const campaignsSnap = await getDocs(collection(db, "campaigns"));
    const usersSnap = await getDocs(collection(db, "users"));
    const usersByEmail = usersSnap.docs.reduce((acc, doc) => {
        const data = doc.data();
        if (data.email) { acc[data.email] = data; }
        return acc;
    }, {} as { [email: string]: UserData });

    const campaignData = campaignsSnap.docs.map(d => {
        const campaign = d.data();
        const user = usersByEmail[campaign.email];
        return {
            Email: campaign.email,
            Offer: campaign.offer,
            SentAt: campaign.sentAt,
            Type: campaign.type,
            Activated: user?.features?.aiTaxCoach ? "Yes" : "No",
            ActivatedAt: user?.aiTrialActivatedAt || "",
            Plan: user?.plan?.id || 'N/A'
        };
    });

    const totalInvites = campaignData.length;
    const totalActivations = campaignData.filter(c => c.Activated === "Yes").length;

    // Generate PDF
    const pdfBuffer = await generateCampaignSummaryPDF(campaignData);

    // Send email
    try {
        await resend.emails.send({
            from: "FlowBank Digest <digest@flowbank.ai>",
            to: "support@flowbank.ai", // Send to admin
            subject: `Daily Campaign Digest - ${new Date().toLocaleDateString()}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px">
                    <h2>Daily AI Campaign Digest 📈</h2>
                    <p>Here's your summary for today:</p>
                    <ul>
                        <li><strong>Total Invites Sent:</strong> ${totalInvites}</li>
                        <li><strong>Total Activations:</strong> ${totalActivations}</li>
                    </ul>
                    <p>See the attached PDF for a detailed breakdown.</p>
                    <br/>
                    <p>– The FlowBank System</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'campaign-summary.pdf',
                    content: pdfBuffer,
                },
            ],
        });
        return { success: true, message: "Digest sent successfully." };
    } catch (error) {
        console.error("Failed to send digest email:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function getCronConfig() {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access this action.");
    }
    
    const cronRef = doc(db, "config", "cron");
    const snap = await getDoc(cronRef);
    const cronValue = snap.exists() ? snap.data()?.campaignDigest : "0 9 * * *";
    return { cron: cronValue };
}

export async function saveCronConfig(cron: string) {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
        throw new Error("You do not have permission to access this action.");
    }

    const cronRef = doc(db, "config", "cron");
    await setDoc(cronRef, { campaignDigest: cron }, { merge: true });

    await addDoc(collection(db, "logs"), {
        type: "cron_config_updated",
        actor: currentUserClaims.email,
        message: `Updated campaign digest cron to: ${cron}`,
        timestamp: new Date().toISOString()
    });
    
    return { success: true, message: "Cron configuration saved." };
}
