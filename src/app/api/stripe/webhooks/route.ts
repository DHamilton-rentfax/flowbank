
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { plans, addOns } from "@/lib/plans";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { UserPlan } from "@/lib/types";

export const dynamic = "force-dynamic";

async function findUidByCustomer(customerId: string) {
    if (!customerId) return null;
    const userQuery = await getAdminDb().collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
    return userQuery.empty ? null : userQuery.docs[0].id;
}

async function setUserPlan(uid: string, planId: string) {
    if (!uid) return;
    const plan = [...plans, ...addOns].find(p => p.id === planId) || plans.find(p => p.id === "free") || { id: 'free', name: 'Free' };
    
    const userPlanData = {
        id: plan.id,
        name: plan.name,
    };
    
    await getAdminDb().collection("users").doc(uid).set({ plan: userPlanData }, { merge: true });
    await getAdminAuth().setCustomUserClaims(uid, { plan: planId });
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
    
    const db = getAdminDb();
    const auth = getAdminAuth();

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                const uid = sub.metadata.firebaseUID || await findUidByCustomer(sub.customer as string);
                
                if (uid) {
                    const priceId = sub.items.data[0]?.price.id;
                    const plan = [...plans, ...addOns].find(p => p.stripePriceId === priceId);
                    if (plan) {
                        const userDocRef = db.collection("users").doc(uid);
                        const userPlan: Partial<UserPlan> = {
                            id: plan.id,
                            name: plan.name,
                            status: sub.status,
                            stripeSubscriptionId: sub.id,
                            currentPeriodEnd: sub.current_period_end,
                        };
                        await userDocRef.set({ plan: userPlan }, { merge: true });
                        await auth.setCustomUserClaims(uid, { plan: plan.id });
                    }
                }
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                const uid = sub.metadata.firebaseUID || await findUidByCustomer(sub.customer as string);
                if (uid) {
                    const userDocRef = db.collection("users").doc(uid);
                    // Revert to free plan
                    const freePlan = plans.find(p => p.id === 'free')!;
                    const userPlan: Partial<UserPlan> = {
                        id: freePlan.id,
                        name: freePlan.name,
                        status: 'cancelled',
                        stripeSubscriptionId: undefined,
                        currentPeriodEnd: undefined,
                    };
                    await userDocRef.set({ plan: userPlan }, { merge: true });
                    await auth.setCustomUserClaims(uid, { plan: 'free' });
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
