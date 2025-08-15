
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import type { UserPlan } from "@/lib/types";


function deriveFeatures(lookupKeys: string[] = []) {
  const has = (key: string) => lookupKeys.includes(key);

  const isFree = has('free_month_usd');
  const isStarter = has('starter_month_usd') || has('starter_year_usd');
  const isPro = has('pro_month_usd') || has('pro_year_usd');
  const isEntBaseM = has('enterprise_base_month_usd');
  const isEntBaseY = has('enterprise_base_year_usd');
  const isEnterprise = isEntBaseM || isEntBaseY;

  const addAnalytics = has('addon_analytics_month_usd');
  const addPriority = has('addon_support_month_usd');
  const addSeatAddon = has('enterprise_addon_seat_month_usd');

  const features = {
    bankLinking: isFree || isStarter || isPro || isEnterprise,
    manualAllocations: isFree || isStarter || isPro || isEnterprise,
    autoAllocations: isStarter || isPro || isEnterprise,
    aiAllocations: isPro || isEnterprise,
    advancedRules: isPro || isEnterprise,
    analyticsBasic: isFree || isStarter || isPro || isEnterprise,
    analyticsAdvanced: addAnalytics || isPro || isEnterprise,
    prioritySupport: addPriority || isPro || isEnterprise,
  };

  const plan =
    isEnterprise ? 'enterprise' :
    isPro        ? 'pro' :
    isStarter    ? 'starter' :
    isFree       ? 'free' : 'unknown';

  return { plan, features, addSeatAddon, addAnalytics, addPriority, isEnterprise };
}

async function findUidForCustomer(customerId: string, session?: Stripe.Checkout.Session | { subscription: Stripe.Subscription }) {
    if (!customerId) return null;
    const db = getAdminDb();
    
    const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
    if (!userQuery.empty) return userQuery.docs[0].id;
    
    if (session) {
        if ('metadata' in session && session.metadata?.firebaseUid) {
            return session.metadata.firebaseUid;
        }
        if ('subscription' in session && typeof session.subscription !== 'string' && session.subscription.metadata?.firebaseUid) {
            return session.subscription.metadata.firebaseUid;
        }
    }
    
    return null;
}


function summarizeSubscription(sub: Stripe.Subscription) {
  const items = sub.items?.data || [];
  const lookupKeys = items.map(i => i.price.lookup_key).filter(Boolean) as string[];
  const seatItem = items.find(i => i.price.lookup_key === 'addon_seat_month_usd');
  const extraSeats = seatItem?.quantity || 0;
  const includedSeats = 10;
  const totalSeats = sub.metadata?.plan === 'enterprise'
    ? includedSeats + extraSeats
    : (sub.metadata?.includedSeats ? Number(sub.metadata.includedSeats) : 1);

  return {
    subscriptionId: sub.id,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end * 1000,
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    collectionMethod: sub.collection_method,
    planInterval: items[0]?.price?.recurring?.interval || null,
    lookupKeys,
    seats: totalSeats,
    latestInvoiceId: sub.latest_invoice as string || null,
  };
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

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const uid = await findUidForCustomer(customerId, session);
                if (!uid) break;

                await db.collection('users').doc(uid).set({
                    stripeCustomerId: customerId,
                    lastCheckoutSessionId: session.id,
                    billingEmail: session.customer_details?.email || null,
                    updatedAt: new Date().toISOString(),
                }, { merge: true });
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;
                const uid = await findUidForCustomer(customerId, { subscription: sub });
                if (!uid) break;

                const summary = summarizeSubscription(sub);
                const { plan, features } = deriveFeatures(summary.lookupKeys);

                const userRef = db.collection('users').doc(uid);
                await userRef.set({
                    subscription: summary,
                    subscriptionStatus: summary.status,
                    planLookupKeys: summary.lookupKeys,
                    plan: { id: plan, name: plan.charAt(0).toUpperCase() + plan.slice(1) }, // Simplified plan object
                    features,
                    seats: summary.seats,
                    updatedAt: new Date().toISOString(),
                }, { merge: true });

                await userRef.collection('billingEvents').add({
                    type: event.type,
                    at: new Date().toISOString(),
                    snapshot: { plan, status: summary.status, lookupKeys: summary.lookupKeys, seats: summary.seats }
                });
                break;
            }

            case 'invoice.payment_failed':
            case 'invoice.payment_succeeded':
            case 'invoice.finalized':
            case 'invoice.voided':
            case 'invoice.marked_uncollectible': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;
                const uid = await findUidForCustomer(customerId);
                if (!uid) break;
                await db.collection('users').doc(uid).collection('billingEvents').add({
                    type: event.type,
                    invoiceId: invoice.id,
                    amountDue: invoice.amount_due,
                    amountPaid: invoice.amount_paid,
                    status: invoice.status,
                    at: new Date().toISOString(),
                });
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
