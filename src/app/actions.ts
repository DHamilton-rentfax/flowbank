
"use server";

import { suggestAllocationPlan, type SuggestAllocationPlanInput } from "@/ai/flows/suggest-allocation-plan";
import { identifyIncome, type IdentifyIncomeInput } from "@/ai/flows/identify-income";
import { chat, type ChatInput } from "@/ai/flows/chatbot";
import { getFinancialCoaching, type FinancialCoachInput } from "@/ai/flows/financial-coach-flow";
import { z } from "zod";
import { plaidClient } from "@/lib/plaid";
import { Products, TransactionsSyncRequest } from "plaid";
import { CountryCode } from "plaid";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { db } from "@/firebase/server";
import { auth as adminAuth } from "firebase-admin";
import { plans, addOns, initialRulesForNewUser } from "@/lib/plans";
import * as OTPAuth from 'otpauth';
import type { Account, UserPlan } from "@/lib/types";

const getUserId = async () => {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        throw new Error("User not authenticated");
    }
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    return decodedToken.uid;
};

export async function createUserDocument(userId: string, email: string, displayName?: string | null, planId?: string | null) {
    const userDocRef = db.collection("users").doc(userId);
    
    const selectedPlanId = planId || 'free';
    const plan = plans.find(p => p.id === selectedPlanId);

    if (!plan) throw new Error(`Plan with ID "${selectedPlanId}" not found.`);
    
    const stripeCustomer = await stripe.customers.create({
        email,
        name: displayName || email,
        metadata: {
            firebaseUID: userId,
        },
    });

    const userPlan: UserPlan = {
        id: plan.id,
        name: plan.name,
        status: 'active',
        stripeCustomerId: stripeCustomer.id,
        addOns: {},
        role: 'user', // Default role for new signups
    };

    const userData = {
        email,
        displayName: displayName || email,
        createdAt: new Date().toISOString(),
        stripeCustomerId: stripeCustomer.id,
        plan: userPlan,
    };

    const batch = db.batch();
    batch.set(userDocRef, userData);

    const newRules = initialRulesForNewUser();
    newRules.forEach((rule) => {
        const account: Account = { id: rule.id, name: rule.name, balance: 0 };
        
        const ruleDocRef = db.collection("users").doc(userId).collection("rules").doc(rule.id);
        batch.set(ruleDocRef, rule);

        const accountDocRef = db.collection("users").doc(userId).collection("accounts").doc(rule.id);
        batch.set(accountDocRef, account);
    });

    await batch.commit();
}


export async function getAISuggestion(input: SuggestAllocationPlanInput) {
    try {
        const result = await suggestAllocationPlan(input);
        
        const plan = JSON.parse(result.allocationPlan);
        
        const planSchema = z.record(z.string(), z.number());
        const parsedPlan = planSchema.parse(plan);
        
        return {
            success: true,
            plan: parsedPlan,
            explanation: result.breakdownExplanation,
        };
    } catch (error) {
        console.error("Error getting AI suggestion:", error);
        
        let errorMessage = "An unknown error occurred.";
        if (error instanceof SyntaxError) {
            errorMessage = "Failed to parse AI response. The format was unexpected.";
        } else if (error instanceof z.ZodError) {
            errorMessage = "AI response had an invalid data structure.";
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function getChatbotResponse(input: ChatInput) {
    try {
        const result = await chat(input);
        return { success: true, response: result.response };
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function getAIFinancialCoach(input: FinancialCoachInput) {
    try {
        const result = await getFinancialCoaching(input);
        return { success: true, advice: result };
    } catch (error) {
        console.error("Error getting AI financial coaching:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function createLinkToken(userId: string) {
    if (!userId) throw new Error("User not authenticated");

    try {
        const tokenRequest: any = {
          user: {
            client_user_id: userId,
          },
          client_name: 'Flow Bank',
          country_codes: [CountryCode.Us],
          language: 'en',
          webhook: `${process.env.NEXT_PUBLIC_SITE_URL}/api/plaid/webhook`,
          products: [Products.Auth, Products.Transactions],
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

export async function exchangePublicToken(publicToken: string, userId: string) {
    if (!userId) throw new Error("User not authenticated");

    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
  
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // Save the access token to the user's document
      await db.collection("users").doc(userId).set({ 
        plaidAccessToken: accessToken,
        plaidItemId: itemId 
      }, { merge: true });
  
      return { 
        success: true, 
        message: "Bank account linked successfully!" 
      };
    } catch (error) {
      console.error("Error exchanging public token:", error);
      return { success: false, error: "Failed to link bank account." };
    }
}

export async function getTransactions(accessToken: string, initialCursor: string | null) {
    try {
        let added: any[] = [];
        let modified: any[] = [];
        let removed: any[] = [];
        let hasMore = true;
        let cursor = initialCursor || undefined;

        while(hasMore) {
            const request: TransactionsSyncRequest = {
                access_token: accessToken,
                cursor: cursor,
            };
            const response = await plaidClient.transactionsSync(request);
            
            added = added.concat(response.data.added);
            modified = modified.concat(response.data.modified);
            removed = removed.concat(response.data.removed);

            hasMore = response.data.has_more;
            cursor = response.data.next_cursor;
        }

        return { success: true, added, modified, removed, nextCursor: cursor };

    } catch (error) {
        console.error("Error fetching transactions:", error);
        return { success: false, error: "Could not fetch transactions." };
    }
}

export async function findIncomeTransactions(input: IdentifyIncomeInput) {
    try {
        const result = await identifyIncome(input);
        return { success: true, incomeTransactions: result.incomeTransactions };
    } catch (error) {
        console.error("Error identifying income:", error);
        return { success: false, error: "Failed to identify income from transactions." };
    }
}

export async function createStripeConnectedAccount(userId: string, email: string) {
    try {
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();
        if (userDoc.exists && userDoc.data()?.stripeAccountId) {
            const accountId = userDoc.data()!.stripeAccountId;
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${headers().get('origin')}/settings`,
                return_url: `${headers().get('origin')}/settings`,
                type: 'account_onboarding',
            });
            return { success: true, url: accountLink.url };
        }

        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        // Save the Stripe account ID to the user's document in Firestore
        await userDocRef.set({ stripeAccountId: account.id }, { merge: true });

        const origin = headers().get('origin');
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${origin}/settings`,
            return_url: `${origin}/settings`,
            type: 'account_onboarding',
        });
        
        return { success: true, url: accountLink.url };
    } catch (error) {
        console.error("Error creating Stripe connected account:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to create Stripe account: ${errorMessage}` };
    }
}


export async function createCheckoutSession(userId: string, planId: string) {
    try {
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            throw new Error("User not found");
        }
        const user = userDoc.data();
        const stripeCustomerId = user!.stripeCustomerId;
        const plan = plans.find(p => p.id === planId);

        if (!plan || !plan.stripePriceId) {
            throw new Error("Plan not found or not configured for Stripe.");
        }
        
        const origin = headers().get('origin') || process.env.NEXT_PUBLIC_SITE_URL;

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [{
                price: plan.stripePriceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing`,
            metadata: {
                userId,
                planId: plan.id,
                type: 'plan'
            }
        });

        return { success: true, url: session.url };
    } catch (error) {
        console.error("Error creating checkout session:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to create checkout session: ${errorMessage}` };
    }
}

export async function createAddOnCheckoutSession(userId: string, addOnId: string) {
    try {
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) throw new Error("User not found");
        
        const userData = userDoc.data();
        const stripeCustomerId = userData!.stripeCustomerId;
        const addOn = addOns.find(a => a.id === addOnId);
        
        if (!addOn) throw new Error("Add-on not found.");
        
        const origin = headers().get('origin') || process.env.NEXT_PUBLIC_SITE_URL;

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [{
                price: addOn.stripePriceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${origin}/settings?tab=add-ons`,
            cancel_url: `${origin}/settings?tab=add-ons`,
            metadata: {
                userId,
                addOnId: addOn.id,
                type: 'add-on',
            }
        });

        return { success: true, url: session.url };
    } catch (error) {
        console.error("Error creating add-on checkout session:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to create checkout session: ${errorMessage}` };
    }
}


export async function createCustomerPortalSession(userId: string) {
    try {
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            throw new Error("User not found");
        }
        
        const userData = userDoc.data();
        const stripeCustomerId = userData!.stripeCustomerId;
        if (!stripeCustomerId) {
            throw new Error("User does not have a Stripe customer ID.");
        }

        const origin = headers().get('origin') || process.env.NEXT_PUBLIC_SITE_URL;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${origin}/settings`,
        });

        return { success: true, url: portalSession.url };
    } catch (error) {
        console.error("Error creating customer portal session:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to create customer portal session: ${errorMessage}` };
    }
}


export async function setup2FA() {
    const userId = await getUserId();
    const userDoc = await db.collection('users').doc(userId).get();
    const email = userDoc.data()?.email;

    if (!userId || !email) {
        throw new Error("User not authenticated or email is missing.");
    }
    
    try {
        // Generate a new secret for the user.
        const totp = new OTPAuth.TOTP({
            issuer: 'FlowBank',
            label: email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: new OTPAuth.Secret()
        });

        const uri = totp.toString();
        
        // Don't save the secret to the user doc yet.
        // It should be saved only after the user successfully verifies the code.

        return { success: true, secret: totp.secret.base32, uri };

    } catch (error) {
        console.error("Error setting up 2FA:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to set up 2FA: ${errorMessage}` };
    }
}

export async function signUpUser(email: string, password: string, planId?: string | null) {
    try {
        const userRecord = await adminAuth().createUser({ email, password });
        const { uid } = userRecord;

        await createUserDocument(uid, email, null, planId);
        
        // Create a custom token for the client to sign in
        const customToken = await adminAuth().createCustomToken(uid);

        return { success: true, customToken };

    } catch (error) {
        console.error("Sign up failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function handleInstantPayout() {
    try {
        const userId = await getUserId();
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) throw new Error("User not found.");
        
        const userData = userDoc.data()!;
        const customerId = userData.stripeCustomerId;

        // 1. Check if user is on unlimited plan
        const unlimitedAddOn = addOns.find(a => a.id === 'instant_payouts');
        if (!unlimitedAddOn || !unlimitedAddOn.stripePriceId) throw new Error("Instant Payouts add-on not configured.");

        const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active' });
        const hasUnlimited = subscriptions.data.some(sub => 
            sub.items.data.some(item => item.price.id === unlimitedAddOn.stripePriceId)
        );

        if (hasUnlimited) {
            return { success: true, charged: false, upgraded: false, message: "Unlimited plan is active. No charge needed." };
        }

        // 2. Log payout use
        const now = new Date();
        const month = `${now.getFullYear()}-${now.getMonth() + 1}`;
        const payoutLogRef = db.collection("payout_logs").doc(userId);
        const logSnap = await payoutLogRef.get();
        
        let usageCount = 0;
        if (logSnap.exists) {
            usageCount = (logSnap.data()?.[month] || 0) + 1;
            await payoutLogRef.update({ [month]: usageCount });
        } else {
            usageCount = 1;
            await payoutLogRef.set({ [month]: 1 });
        }
        
        // 3. Charge $2
        const paymentMethods = await stripe.paymentMethods.list({ customer: customerId, type: 'card' });
        if (paymentMethods.data.length === 0) {
            throw new Error("No payment method on file. Please add a card in your settings.");
        }

        await stripe.paymentIntents.create({
            amount: 200, // $2.00
            currency: 'usd',
            customer: customerId,
            payment_method: paymentMethods.data[0].id,
            off_session: true,
            confirm: true,
        });

        // 4. Auto-upgrade after 3 uses
        if (usageCount >= 3) {
            await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: unlimitedAddOn.stripePriceId }],
                proration_behavior: 'none', // Don't prorate
            });
            // Update user's plan in Firestore
            const userPlan = userData.plan || {};
            userPlan.addOns = { ...userPlan.addOns, 'instant_payouts': true };
            await userDocRef.update({ plan: userPlan });

            return { success: true, charged: true, upgraded: true, message: "Charged $2.00 and auto-upgraded to unlimited payouts!" };
        }

        return { success: true, charged: true, upgraded: false, message: `Charged $2.00. You've used instant payouts ${usageCount} time(s) this month.` };

    } catch (error) {
        console.error("Error handling instant payout:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function createTestCharge() {
    try {
        const userId = await getUserId();
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) throw new Error("User not found.");
        
        const userData = userDoc.data()!;
        const customerId = userData.stripeCustomerId;

        const paymentMethods = await stripe.paymentMethods.list({ customer: customerId, type: 'card' });
        if (paymentMethods.data.length === 0) {
            throw new Error("No payment method on file. Please add a card in your settings.");
        }

        await stripe.paymentIntents.create({
            amount: 100, // $1.00
            currency: 'usd',
            customer: customerId,
            payment_method: paymentMethods.data[0].id,
            off_session: true,
            confirm: true,
            description: "Test charge from FlowBank"
        });

        return { success: true, message: "Successfully created a $1.00 test charge." };

    } catch (error) {
        console.error("Error creating test charge:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function createPaymentLink(description: string, amount: number) {
    try {
        const userId = await getUserId();
        const userDocRef = db.collection("users").doc(userId);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) throw new Error("User not found.");
        
        const userData = userDoc.data()!;
        const stripeAccountId = userData.stripeAccountId;

        if (!stripeAccountId) {
            throw new Error("Stripe account not connected. Please connect your Stripe account in settings.");
        }

        // Create a product for the payment
        const product = await stripe.products.create({
            name: description,
        });

        // Create a price for the product
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount * 100, // Amount in cents
            currency: 'usd',
        });

        // Create the payment link
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{ price: price.id, quantity: 1 }],
            transfer_data: {
                destination: stripeAccountId,
            },
        });

        // Save the payment link to Firestore
        const paymentLinkData = {
            id: paymentLink.id,
            userId,
            description,
            amount,
            url: paymentLink.url,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        await db.collection("users").doc(userId).collection("payment_links").doc(paymentLink.id).set(paymentLinkData);


        return { success: true, url: paymentLink.url };

    } catch (error) {
        console.error("Error creating payment link:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function submitFeedback(feedback: string) {
    try {
        const userId = await getUserId();
        const userDoc = await db.collection('users').doc(userId).get();
        const userEmail = userDoc.data()?.email || 'unknown';

        // In a real app, you would save this to a database or send it to a support tool.
        // For now, we'll just log it to the server console.
        console.log(`Feedback from ${userEmail} (${userId}):`);
        console.log(feedback);

        // You could also use a Genkit flow to summarize or categorize feedback.

        return { 
            success: true, 
            message: "Thank you for your feedback! We've received it and will review it shortly." 
        };

    } catch (error) {
        console.error("Error submitting feedback:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
