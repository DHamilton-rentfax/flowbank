
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

async function findUidForCustomer(customerId: string, session?: any): Promise<string | null> {
    if (!customerId) return null;
    const db = getAdminDb();
    
    // First, try a direct lookup in the users collection
    const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
    if (!userQuery.empty) {
        return userQuery.docs[0].id;
    }

    // Fallback for checkout sessions where the customer ID might not be in Firestore yet
    if (session?.metadata?.firebaseUid) {
        return session.metadata.firebaseUid;
    }
     if (session?.subscription?.metadata?.firebaseUid) {
        return session.subscription.metadata.firebaseUid;
    }

    console.warn(`Webhook Warning: Could not find user for customerId ${customerId}`);
    return null;
}

function deriveFeatures(lookupKeys: string[] = []) {
  const has = (key: string) => lookupKeys.includes(key);

  const isFree     = has('free_month_usd');
  const isStarter  = has('starter_month_usd') || has('starter_year_usd');
  const isPro      = has('pro_month_usd')     || has('pro_year_usd');
  const isEntBaseM = has('enterprise_base_month_usd');
  const isEntBaseY = has('enterprise_base_year_usd');
  const isEnterprise = isEntBaseM || isEntBaseY;

  const addAnalytics = has('addon_analytics_month_usd');
  const addPriority  = has('addon_support_month_usd');

  // Default feature set
  const features = {
    bankLinking: true, // Always available
    manualAllocations: true, // Always available
    autoAllocations: isStarter || isPro || isEnterprise,
    aiAllocations: isPro || isEnterprise,
    advancedRules: isPro || isEnterprise,
    analyticsBasic: true, // Always available
    analyticsAdvanced: addAnalytics || isPro || isEnterprise,
    prioritySupport: addPriority || isPro || isEnterprise,
  };

  const plan =
    isEnterprise ? 'enterprise' :
    isPro        ? 'pro' :
    isStarter    ? 'starter' :
    isFree       ? 'free' : 'unknown';

  return { plan, features };
}

function summarizeSubscription(sub: Stripe.Subscription) {
  const items = sub.items?.data || [];
  const lookupKeys = items.map(i => i.price.lookup_key).filter(Boolean) as string[];
  const seatItem = items.find(i => i.price.lookup_key === 'enterprise_addon_seat_month_usd'); // Or your actual seat lookup key
  const extraSeats = seatItem?.quantity || 0;
  const includedSeats = sub.metadata?.plan === 'enterprise' ? 10 : 1; // Example logic
  const totalSeats = includedSeats + extraSeats;

  return {
    subscriptionId: sub.id,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end * 1000,
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    collectionMethod: sub.collection_method,
    planInterval: items[0]?.price?.recurring?.interval || null,
    lookupKeys,
    seats: totalSeats,
    latestInvoiceId: sub.latest_invoice as string | null,
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
    const data = event.data.object as any;

    try {
        const customerId = data.customer as string;
        const uid = await findUidForCustomer(customerId, data);

        if (uid) {
            // Log every event to a subcollection for auditing
            await db.collection('users').doc(uid).collection('billingEvents').add({
                type: event.type,
                data: event.data.object,
                receivedAt: FieldValue.serverTimestamp(),
            });
            console.log(`Logged event ${event.type} for user ${uid}`);
        } else if (event.type !== 'customer.created' && event.type !== 'customer.updated') {
            // Don't error out on customer creation since UID might not be known yet
            console.warn(`Webhook for non-user event received, or user not found for customerId ${customerId}. Event type: ${event.type}`);
        }


        switch (event.type) {
             case 'checkout.session.completed': {
                if (uid) {
                    await db.collection('users').doc(uid).set({
                        stripeCustomerId: customerId,
                        lastCheckoutSessionId: data.id,
                        billingEmail: data.customer_details?.email || null,
                        updatedAt: FieldValue.serverTimestamp(),
                    }, { merge: true });
                }
                break;
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                if (!uid) {
                    console.warn(`Webhook: No user found for customer ID ${customerId}. Cannot sync subscription.`);
                    break;
                }
                
                const userRef = db.collection('users').doc(uid);
                const subscription = event.data.object as Stripe.Subscription;
                const summary = summarizeSubscription(subscription);
                const { plan, features } = deriveFeatures(summary.lookupKeys);

                const planData = {
                    plan,
                    features,
                    seats: summary.seats,
                    subscription: summary,
                    subscriptionStatus: summary.status,
                    planLookupKeys: summary.lookupKeys,
                    updatedAt: FieldValue.serverTimestamp(),
                };

                await userRef.set(planData, { merge: true });
                console.log(`Synced plan for ${userRef.id}: ${plan} (${summary.status})`);
                break;
            }
            case 'invoice.payment_succeeded': {
                if (uid) {
                    const invoice = event.data.object as Stripe.Invoice;
                    const taxDetails = {
                        invoiceId: invoice.id,
                        tax: invoice.tax,
                        tax_percent: invoice.tax_percent,
                        total_tax_amounts: invoice.total_tax_amounts,
                    };
                    // Log specific tax details to the billing event for auditing
                    const eventLogRef = db.collection('users').doc(uid).collection('billingEvents').doc();
                    await eventLogRef.set({
                        type: event.type,
                        taxDetails: taxDetails,
                        data: event.data.object,
                        receivedAt: FieldValue.serverTimestamp(),
                    });
                }
                break;
            }
             case 'invoice.payment_failed':
             case 'invoice.finalized':
             case 'invoice.voided':
             case 'invoice.marked_uncollectible': {
                // The detailed invoice event is already logged above.
                // You could add specific logic here, e.g., send an email on payment failure.
                console.log(`Received invoice event: ${event.type}`);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new NextResponse(null, { status: 200 });

    } catch (e) {
        console.error("Stripe webhook handler failed with error:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return new NextResponse(errorMessage, { status: 500 });
    }
}
