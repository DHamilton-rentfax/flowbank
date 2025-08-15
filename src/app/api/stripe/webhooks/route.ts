
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { plans, addOns } from "@/lib/plans";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import type { UserPlan } from "@/lib/types";

export const dynamic = "force-dynamic";

async function findUidByCustomer(customerId: string): Promise<string | null> {
    if (!customerId) return null;
    const db = getAdminDb();
    
    // First, try to find the user by the stored stripeCustomerId
    const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
    if (!userQuery.empty) {
        return userQuery.docs[0].id;
    }
    
    // Fallback: If not found, check the customer's metadata in Stripe
    try {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.metadata.firebaseUid) {
            return customer.metadata.firebaseUid;
        }
    } catch (error) {
        console.error(`Could not retrieve or find metadata for Stripe customer ${customerId}:`, error);
    }

    console.warn(`Webhook: Could not find a Firebase UID for Stripe customer ${customerId}.`);
    return null;
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, status: UserPlan['status']) {
    const db = getAdminDb();
    const auth = getAdminAuth();
    
    const uid = await findUidByCustomer(subscription.customer as string);
    if (!uid) {
        console.warn(`Webhook Error: Could not find user for Stripe customer ${subscription.customer}. Skipping plan update.`);
        return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    const isCancellation = status === 'cancelled';
    
    // On cancellation, revert to the 'free' plan. Otherwise, find the matching plan.
    const targetPlan = isCancellation 
        ? plans.find(p => p.id === 'free')
        : [...plans, ...addOns].find(p => p.stripePriceId === priceId || p.stripeYearlyPriceId === priceId);

    if (!targetPlan) {
        console.warn(`Webhook Warning: Could not find a plan in config for price ID ${priceId}. User ${uid} will not be updated.`);
        return;
    }

    const userDocRef = db.collection("users").doc(uid);

    // Prepare the new plan data for Firestore
    const userPlanUpdate: Partial<UserPlan> = {
        id: targetPlan.id,
        name: targetPlan.name,
        status: status,
        stripeSubscriptionId: isCancellation ? undefined : subscription.id,
        currentPeriodEnd: isCancellation ? undefined : subscription.current_period_end,
    };
    
    // Update Firestore document
    await userDocRef.set({ plan: userPlanUpdate }, { merge: true });

    // Update Firebase Auth custom claims
    await auth.setCustomUserClaims(uid, { plan: targetPlan.id });

    console.log(`Successfully updated plan for user ${uid} to ${targetPlan.name} (${status}).`);
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Stripe webhook secret (STRIPE_WEBHOOK_SECRET) is not set.");
        return new NextResponse("Webhook secret not configured.", { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                console.log(`Processing subscription update for status: ${sub.status}`);
                await handleSubscriptionChange(sub, sub.status);
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                console.log(`Processing subscription cancellation.`);
                await handleSubscriptionChange(sub, 'cancelled');
                break;
            }
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                // This event is useful for handling one-time payments or for actions
                // that need to happen immediately after the first payment, before the subscription is fully 'active'.
                // For subscriptions, the customer.subscription.* events are generally more reliable for status changes.
                if (session.mode === 'subscription') {
                    const uid = session.metadata?.firebaseUid;
                    if (uid) {
                        await getAdminDb().collection('users').doc(uid).set({
                            stripeCustomerId: session.customer,
                        }, { merge: true });
                        console.log(`Checkout session completed for user ${uid}. Associated Stripe customer ${session.customer}.`);
                    }
                }
                 break;
            }
        }
        return new NextResponse(null, { status: 200 });
    } catch (e) {
        console.error("Stripe webhook handler failed with error:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return new NextResponse(errorMessage, { status: 500 });
    }
}
