
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { getAdminApp } from "@/firebase/server";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { plans, addOns } from "@/lib/plans";
import type { UserPlan } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    const sessionType = session.metadata?.type;
    const adminDb = getAdminApp().firestore();

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = session.metadata?.userId;
        
        if (!userId) {
            console.error("Webhook Error: Missing userId in session metadata");
            return new NextResponse("Webhook Error: Missing metadata", { status: 400 });
        }
        
        const userDocRef = adminDb.collection("users").doc(userId);

        if (sessionType === 'plan') {
            const planId = session.metadata?.planId;
            if (!planId) {
                return new NextResponse("Webhook Error: Missing planId for 'plan' type session", { status: 400 });
            }

            const plan = plans.find(p => p.id === planId);
            if (!plan) {
                return new NextResponse(`Webhook Error: Plan with id ${planId} not found.`, { status: 400 });
            }

            const userPlan: UserPlan = {
                id: plan.id,
                name: plan.name,
                status: 'active',
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                currentPeriodEnd: subscription.current_period_end,
                addOns: {}, // Initialize addOns
            };
            
            await userDocRef.set({ plan: userPlan }, { merge: true });

        } else if (sessionType === 'add-on') {
            const addOnId = session.metadata?.addOnId;
            if (!addOnId) {
                return new NextResponse("Webhook Error: Missing addOnId for 'add-on' type session", { status: 400 });
            }
            
            const addOn = addOns.find(a => a.id === addOnId);
            if (!addOn) {
                return new NextResponse(`Webhook Error: Add-on with id ${addOnId} not found.`, { status: 400 });
            }
            
            const userDoc = await userDocRef.get();
            if(userDoc.exists) {
                const userPlan = userDoc.data()!.plan as UserPlan;
                userPlan.addOns = { ...userPlan.addOns, [addOnId]: true };
                await userDocRef.set({ plan: userPlan }, { merge: true });
            }
        }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
         const subscription = event.data.object as Stripe.Subscription;
         const customerId = subscription.customer as string;

         const userQuery = await adminDb.collection('users').where('stripeCustomerId', '==', customerId).get();
         if (userQuery.empty) {
             console.error(`No user found with Stripe customer ID ${customerId}`);
             return new NextResponse("User not found", { status: 404 });
         }
         const userId = userQuery.docs[0].id;
         const userDocRef = adminDb.collection("users").doc(userId);
         const userDoc = await userDocRef.get();
         
         if (userDoc.exists()) {
            let userPlan = userDoc.data()!.plan as UserPlan;
            const priceId = subscription.items.data[0].price.id;
            
            // Check if this subscription is for a main plan or an add-on
            const plan = plans.find(p => p.stripePriceId === priceId);
            const addOn = addOns.find(a => a.stripePriceId === priceId);

            if (plan) {
                 userPlan = {
                    ...userPlan,
                    id: plan.id,
                    name: plan.name,
                    status: subscription.status,
                    stripeSubscriptionId: subscription.id,
                    currentPeriodEnd: subscription.current_period_end,
                 };
            } else if (addOn) {
                const currentAddOns = userPlan.addOns || {};
                if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                    delete currentAddOns[addOn.id];
                } else {
                    currentAddOns[addOn.id] = subscription.status === 'active';
                }
                userPlan.addOns = currentAddOns;
            } else {
                 console.error(`No plan or add-on found for price ID ${priceId}`);
            }

            await userDocRef.set({ plan: userPlan }, { merge: true });
         }
    }


    return new NextResponse(null, { status: 200 });
}
