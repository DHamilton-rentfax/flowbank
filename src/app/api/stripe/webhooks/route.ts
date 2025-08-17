
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

function parseAddonsFromMetadata(items: Stripe.SubscriptionItem[]) {
  const addons: Record<string, boolean | number> = {
    ai_optimization: false,
    priority_support: false,
    extra_seats: 0,
    advanced_analytics: false,
  };
  
  for (const item of items) {
    const lookupKey = item.price.lookup_key;
    if (!lookupKey) continue;
    if (lookupKey.startsWith('addon_analytics')) addons.advanced_analytics = true;
    if (lookupKey.startsWith('addon_support')) addons.priority_support = true;
    if (lookupKey.startsWith('addon_ai_optimization') || lookupKey.startsWith('addon_ai_upgrade')) addons.ai_optimization = true;
    if (lookupKey.startsWith('addon_seat') || lookupKey.startsWith('addon_extra_seats') || lookupKey.startsWith('addon_seat_month_usd')) addons.extra_seats = item.quantity || 0;
  }
  return addons;
}


function deriveFeatures(lookupKeys: string[] = [], addons: Record<string, boolean | number>) {
  const has = (key: string) => lookupKeys.some(k => k.startsWith(key));

  const isFree     = has('free');
  const isStarter  = has('starter');
  const isPro      = has('pro');
  const isEnterprise = has('enterprise');

  const plan =
    isEnterprise ? 'enterprise' :
    isPro        ? 'pro' :
    isStarter    ? 'starter' :
    isFree       ? 'free' : 'unknown';

  // Default feature set based on plan, then override with addons
  const features = {
    bankLinking: true,
    manualAllocations: true,
    autoAllocations: isStarter || isPro || isEnterprise,
    aiSuggestions: isStarter || isPro || isEnterprise, // Basic AI
    advancedRules: isPro || isEnterprise,
    prioritySupport: isPro || isEnterprise,
    analyticsAdvanced: isPro || isEnterprise,
    aiTaxCoach: false, // Add-on only
  };
  
  if(addons.priority_support) features.prioritySupport = true;
  if(addons.advanced_analytics) features.analyticsAdvanced = true;
  if(addons.ai_optimization) features.aiTaxCoach = true;


  return { plan, features, addons };
}

function summarizeSubscription(sub: Stripe.Subscription) {
  const items = sub.items?.data || [];
  const lookupKeys = items.map(i => i.price.lookup_key).filter(Boolean) as string[];
  const seatItem = items.find(i => i.price.lookup_key?.includes('seat'));
  const extraSeats = seatItem?.quantity || 0;
  
  let includedSeats = 0;
  if (lookupKeys.some(k => k.includes('enterprise'))) includedSeats = 10;
  else if (lookupKeys.some(k => k.includes('pro'))) includedSeats = 5;
  else if (lookupKeys.some(k => k.includes('starter'))) includedSeats = 1;


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
    items: items.map(item => ({ priceId: item.price.id, lookupKey: item.price.lookup_key, quantity: item.quantity }))
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

                    // If a subscription was created, sync it immediately
                    if (data.subscription) {
                        const subscription = await stripe.subscriptions.retrieve(data.subscription, { expand: ['items.data.price'] });
                        const userRef = db.collection('users').doc(uid);
                        const summary = summarizeSubscription(subscription);
                        const { plan, features, addons } = deriveFeatures(summary.lookupKeys, parseAddonsFromMetadata(subscription.items.data));
                         const planData = {
                            plan: { id: plan, name: plan.charAt(0).toUpperCase() + plan.slice(1) },
                            features,
                            addons,
                            seats: summary.seats,
                            subscription: summary,
                            subscriptionStatus: summary.status,
                            planLookupKeys: summary.lookupKeys,
                            updatedAt: FieldValue.serverTimestamp(),
                        };
                        await userRef.set(planData, { merge: true });
                        console.log(`Synced initial plan for ${userRef.id}: ${plan} (${summary.status})`);
                    }
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
                // We need to retrieve it again to expand the price object with lookup_key
                const fullSubscription = await stripe.subscriptions.retrieve(subscription.id, { expand: ['items.data.price'] });
                
                const summary = summarizeSubscription(fullSubscription);
                const { plan, features, addons } = deriveFeatures(summary.lookupKeys, parseAddonsFromMetadata(fullSubscription.items.data));

                const planData = {
                    plan: { id: plan, name: plan.charAt(0).toUpperCase() + plan.slice(1) },
                    features,
                    addons,
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
                        tax_breakdown: (invoice as any).tax_breakdown,
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
