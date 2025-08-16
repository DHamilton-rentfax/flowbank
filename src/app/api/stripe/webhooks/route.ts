
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

async function findUidForCustomer(customerId: string) {
    if (!customerId) return null;
    const db = getAdminDb();
    
    const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
    if (!userQuery.empty) {
        return userQuery.docs[0].id;
    }
    
    console.warn(`Webhook Warning: Could not find user for customerId ${customerId}`);
    return null;
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
    
    const db = getAdminDb();
    const data = event.data.object as any; // Use any to access properties dynamically

    try {
        if (
            event.type === 'customer.subscription.updated' ||
            event.type === 'customer.subscription.created' ||
            event.type === 'customer.subscription.deleted'
        ) {
            const customerId = data.customer as string;
            const uid = await findUidForCustomer(customerId);

            if (!uid) {
                console.warn(`Webhook: No user found for customer ID ${customerId}.`);
                return NextResponse.json({ received: true });
            }
            
            const userRef = db.collection('users').doc(uid);
            
            const subscriptionData = {
                stripeSubscriptionStatus: data.status,
                planId: data.items.data[0]?.price.id || null,
                planLookupKey: data.items.data[0]?.price.lookup_key || null,
                lastSynced: FieldValue.serverTimestamp(),
            };

            await userRef.set(subscriptionData, { merge: true });
            console.log(`Synced plan for ${userRef.id}: ${subscriptionData.planLookupKey}`);

        } else {
             console.log(`Unhandled event type: ${event.type}`);
        }

        return new NextResponse(null, { status: 200 });

    } catch (e) {
        console.error("Stripe webhook handler failed with error:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return new NextResponse(errorMessage, { status: 500 });
    }
}
