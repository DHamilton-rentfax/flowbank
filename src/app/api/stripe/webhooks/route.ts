
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { plans } from "@/lib/plans";
import type { UserPlan } from "@/lib/types";

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

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (!userId || !planId) {
            console.error("Webhook Error: Missing userId or planId in session metadata");
            return new NextResponse("Webhook Error: Missing metadata", { status: 400 });
        }
        
        const plan = plans.find(p => p.id === planId);
        if (!plan) {
            console.error(`Webhook Error: Plan with id ${planId} not found.`);
            return new NextResponse("Webhook Error: Plan not found", { status: 400 });
        }

        const userPlan: UserPlan = {
            id: plan.id,
            name: plan.name,
            status: 'active',
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            currentPeriodEnd: subscription.current_period_end,
        };

        try {
            const userDocRef = doc(db, "users", userId);
            await setDoc(userDocRef, { plan: userPlan }, { merge: true });
            console.log(`Successfully updated plan for user ${userId} to ${plan.name}`);
        } catch (error) {
            console.error(`Database error updating user ${userId}:`, error);
            return new NextResponse("Database error", { status: 500 });
        }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
         const subscription = event.data.object as Stripe.Subscription;
         const customerId = subscription.customer as string;

         const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
         if (userQuery.empty) {
             console.error(`No user found with Stripe customer ID ${customerId}`);
             return new NextResponse("User not found", { status: 404 });
         }
         const userId = userQuery.docs[0].id;
         const planId = subscription.items.data[0].price.id;
         const plan = plans.find(p => p.stripePriceId === planId) || plans.find(p => p.id === 'free');

         if (!plan) {
             console.error(`Plan not found for price ID ${planId}`);
             return new NextResponse("Plan not found", { status: 404 });
         }

         const userPlan: UserPlan = {
            id: plan.id,
            name: plan.name,
            status: subscription.status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            currentPeriodEnd: subscription.current_period_end,
         }

        try {
            const userDocRef = doc(db, "users", userId);
            await setDoc(userDocRef, { plan: userPlan }, { merge: true });
        } catch(error) {
             console.error(`Database error updating user ${userId} on subscription update:`, error);
            return new NextResponse("Database error", { status: 500 });
        }
    }


    return new NextResponse(null, { status: 200 });
}
