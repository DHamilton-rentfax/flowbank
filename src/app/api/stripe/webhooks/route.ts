
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/server";


function deriveFeatures(lookupKeys: string[] = []) {
  const has = (key: string) => lookupKeys.includes(key);

  const isFree = has('free_month_usd');
  const isStarter = has('starter_month_usd') || has('starter_year_usd');
  const isPro = has('pro_month_usd') || has('pro_year_usd');
  const isEntBaseM = has('enterprise_base_month_usd') || has('enterprise_base_year_usd');
  const isEnterprise = isEntBaseM || isEntBaseY;

  const addAnalytics = has('addon_analytics_month_usd');
  const addPriority = has('addon_support_month_usd');
  const addSeatAddon = has('addon_seat_month_usd');

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

  const planId =
    isEnterprise ? 'enterprise' :
    isPro        ? 'pro' :
    isStarter    ? 'starter' :
    isFree       ? 'free' : 'unknown';
  
  const plan = {
      id: planId,
      name: planId.charAt(0).toUpperCase() + planId.slice(1)
  }

  return { plan, features };
}

async function findUidForCustomer(customerId: string, session?: Stripe.Checkout.Session | { subscription: Stripe.Subscription }) {
    if (!customerId) return null;
    const db = getAdminDb();
    
    const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
    if (!userQuery.empty) return userQuery.docs[0].id;
    
    // Fallback for first-time checkout
    if (session) {
        if ('metadata' in session && session.metadata?.firebaseUid) {
            return session.metadata.firebaseUid;
        }
        if ('subscription' in session && typeof session.subscription !== 'string' && session.subscription?.metadata?.firebaseUid) {
            return session.subscription.metadata.firebaseUid;
        }
    }
    
    console.log(`Webhook Error: Could not find user for customerId ${customerId}`);
    return null;
}


function summarizeSubscription(sub: Stripe.Subscription) {
  const items = sub.items?.data || [];
  const lookupKeys = items.map(i => i.price.lookup_key).filter(Boolean) as string[];
  const seatItem = items.find(i => i.price.lookup_key === 'addon_seat_month_usd');
  
  let totalSeats = 1; // Default for non-enterprise plans
  if (sub.metadata?.plan === 'enterprise') {
      const includedSeats = sub.metadata?.includedSeats ? Number(sub.metadata.includedSeats) : 10;
      const extraSeats = seatItem?.quantity || 0;
      totalSeats = includedSeats + extraSeats;
  }

  return {
    subscriptionId: sub.id,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end * 1000,
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    collectionMethod: sub.collection_method,
    planInterval: items[0]?.price?.recurring?.interval || null,
    lookupKeys,
    seats: totalSeats,
    latestInvoiceId: typeof sub.latest_invoice === 'string' ? sub.latest_invoice : null,
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
                if (!uid) {
                    console.log(`Webhook: No UID found for checkout session ${session.id}`);
                    break;
                }

                await db.collection('users').doc(uid).set({
                    stripeCustomerId: customerId,
                    lastCheckoutSessionId: session.id,
                    billingEmail: session.customer_details?.email || null,
                }, { merge: true });
                console.log(`Webhook: Updated customer ID for user ${uid}`);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;
                const uid = await findUidForCustomer(customerId, { subscription: sub });
                if (!uid) {
                    console.log(`Webhook: No UID found for subscription ${sub.id}`);
                    break;
                }

                const summary = summarizeSubscription(sub);
                const { plan, features } = deriveFeatures(summary.lookupKeys);

                const userRef = db.collection('users').doc(uid);
                await userRef.set({
                    subscription: summary,
                    subscriptionStatus: summary.status,
                    planLookupKeys: summary.lookupKeys,
                    plan: plan,
                    features,
                    seats: summary.seats,
                }, { merge: true });

                await userRef.collection('billingEvents').add({
                    type: event.type,
                    at: new Date(event.created * 1000).toISOString(),
                    snapshot: { plan: plan.id, status: summary.status, lookupKeys: summary.lookupKeys, seats: summary.seats }
                });
                console.log(`Webhook: Synced subscription ${sub.id} for user ${uid}. Status: ${summary.status}, Plan: ${plan.id}`);
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
                if (!uid) {
                     console.log(`Webhook: No UID found for invoice ${invoice.id}`);
                     break;
                }
                await db.collection('users').doc(uid).collection('billingEvents').add({
                    type: event.type,
                    invoiceId: invoice.id,
                    amountDue: invoice.amount_due,
                    amountPaid: invoice.amount_paid,
                    status: invoice.status,
                    at: new Date(event.created * 1000).toISOString(),
                });
                console.log(`Webhook: Logged invoice event ${event.type} for user ${uid}`);
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
