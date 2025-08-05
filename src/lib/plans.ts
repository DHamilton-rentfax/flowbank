
import { db } from '@/firebase/client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { Plan, UserPlan } from './types';
import { stripe } from './stripe';


export const plans: Plan[] = [
    {
        id: "free",
        name: "Free",
        price: 0,
        features: [
            "1 Bank Connection",
            "3 Split Rules",
            "Manual Splits",
            "Basic Reporting"
        ]
    },
    {
        id: "pro",
        name: "Pro",
        price: 9.99,
        features: [
            "Unlimited Split Rules",
            "Automated Splits",
            "Advanced Reporting",
            "Email & Chat Support"
        ],
        stripePriceId: 'price_1Pge5VGCq4vA4vNqgA3jRk2d' // Replace with your actual Stripe Price ID
    },
    {
        id: "business",
        name: "Business",
        price: 29.99,
        features: [
            "All Pro Features",
            "Multi-account sync",
            "Team Splits & Permissions",
            "Priority Support"
        ],
        stripePriceId: 'price_1Pge5lGCq4vA4vNqlsO0vL6r' // Replace with your actual Stripe Price ID
    }
];

export async function createUserDocument(userId: string, email: string, displayName?: string | null) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        const freePlan = plans.find(p => p.id === 'free');
        if (!freePlan) throw new Error("Free plan not found.");
        
        const stripeCustomer = await stripe.customers.create({
            email,
            name: displayName || email,
            metadata: {
                firebaseUID: userId,
            },
        });

        const userData = {
            email,
            displayName: displayName || email,
            createdAt: new Date().toISOString(),
            stripeCustomerId: stripeCustomer.id,
            plan: {
                id: freePlan.id,
                name: freePlan.name,
                status: 'active'
            } as UserPlan,
        };

        await setDoc(userDocRef, userData);
    }
}
