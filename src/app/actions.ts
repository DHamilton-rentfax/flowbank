
"use server";

import { suggestAllocationPlan, type SuggestAllocationPlanInput } from "@/ai/flows/suggest-allocation-plan";
import { identifyIncome, type IdentifyIncomeInput } from "@/ai/flows/identify-income";
import { chat, type ChatInput } from "@/ai/flows/chatbot";
import { z } from "zod";
import { plaidClient } from "@/lib/plaid";
import { Products, TransactionsSyncRequest } from "plaid";
import { CountryCode } from "plaid";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { db } from "@/firebase/client";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "@/firebase/client";
import { plans, addOns, createUserDocument } from "@/lib/plans";
import * as OTPAuth from 'otpauth';
import { createAssessment } from "@/lib/recaptcha";
import { createUserWithEmailAndPassword } from "firebase/auth";

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

export async function createLinkToken(accessToken?: string | null) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
        const tokenRequest: any = {
          user: {
            client_user_id: user.uid,
          },
          client_name: 'Flow Bank',
          country_codes: [CountryCode.Us],
          language: 'en',
          webhook: `${process.env.NEXT_PUBLIC_SITE_URL}/api/plaid/webhook`,
        };

        if (accessToken) {
            tokenRequest.access_token = accessToken;
            tokenRequest.products = [];
        } else {
            tokenRequest.products = [Products.Auth, Products.Transactions];
        }

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
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
  
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;
  
      return { 
        success: true, 
        accessToken,
        itemId,
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
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, { stripeAccountId: account.id }, { merge: true });

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
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error("User not found");
        }
        const user = userDoc.data();
        const stripeCustomerId = user.stripeCustomerId;
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
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) throw new Error("User not found");
        
        const userData = userDoc.data();
        const stripeCustomerId = userData.stripeCustomerId;
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
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        const stripeCustomerId = userDoc.data().stripeCustomerId;
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
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("User not authenticated or email is missing.");
    }
    
    try {
        // Generate a new secret for the user.
        const totp = new OTPAuth.TOTP({
            issuer: 'FlowBank',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: new OTPAuth.Secret()
        });

        const uri = totp.toString();

        return { success: true, secret: totp.secret.base32, uri };

    } catch (error) {
        console.error("Error setting up 2FA:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to set up 2FA: ${errorMessage}` };
    }
}

export async function verifyRecaptchaAndSignUp(email: string, password: string, token: string, planId?: string | null) {
    try {
        const score = await createAssessment({
            token,
            recaptchaAction: "signup" 
        });

        // For now, we'll accept any score. In a real app, you'd check if the score is above a threshold.
        if (score === null) {
            throw new Error("reCAPTCHA verification failed. Please try again.");
        }

        console.log("reCAPTCHA score:", score);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;

        await createUserDocument(user.uid, user.email!, null, planId);

        return { success: true, userId: user.uid };

    } catch (error) {
        console.error("Sign up with reCAPTCHA failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
