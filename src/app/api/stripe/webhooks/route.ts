
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { plans, addOns } from "@/lib/plans";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import type { UserPlan } from "@/lib/types";

export const dynamic = "force-dynamic";

async function findUidByCustomer(customerId: string) {
    if (!customerId) return null;
    const db = getAdminDb();
    const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
    if (!userQuery.empty) {
        return userQuery.docs[0].id;
    }
    
    // Fallback: Check customer metadata (if you store it there)
    try {
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted) {
            return (customer.metadata.firebaseUID as string) || null;
        }
    } catch (error) {
        console.error(`Could not find customer ${customerId} in Stripe.`);
    }

    return null;
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, status: UserPlan['status']) {
    const db = getAdminDb();
    const auth = getAdminAuth();
    
    const uid = await findUidByCustomer(subscription.customer as string);
    if (!uid) {
        console.warn(`Webhook: Could not find user for Stripe customer ${subscription.customer}`);
        return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    const isCancellation = status === 'cancelled';
    const targetPlan = isCancellation 
        ? plans.find(p => p.id === 'free')
        : [...plans, ...addOns].find(p => p.stripePriceId === priceId);

    if (!targetPlan) {
        console.warn(`Webhook: Could not find plan for price ID ${priceId}`);
        return;
    }

    const userDocRef = db.collection("users").doc(uid);
    const userPlan: Partial<UserPlan> = {
        id: targetPlan.id,
        name: targetPlan.name,
        status: status,
        stripeSubscriptionId: isCancellation ? undefined : subscription.id,
        currentPeriodEnd: isCancellation ? undefined : subscription.current_period_end,
    };
    
    await userDocRef.set({ plan: userPlan }, { merge: true });
    await auth.setCustomUserClaims(uid, { plan: targetPlan.id });
    console.log(`Updated plan for user ${uid} to ${targetPlan.name} (${status})`);
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Stripe webhook secret is not set.");
        return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                await handleSubscriptionChange(sub, sub.status);
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                await handleSubscriptionChange(sub, 'cancelled');
                break;
            }
            // Optional: Handle one-time payment success for non-subscription items
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                // If it's a subscription, the subscription events will handle it.
                // If it's a one-time payment, handle that here.
                if (session.mode === 'payment') {
                    const uid = session.metadata?.firebaseUID;
                    if (uid) {
                        // Logic to grant access for one-time purchases
                        console.log(`One-time payment successful for user ${uid}`);
                    }
                }
                 break;
            }
        }
        return new NextResponse(null, { status: 200 });
    } catch (e) {
        console.error("Stripe webhook handler error:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return new NextResponse(errorMessage, { status: 500 });
    }
}
