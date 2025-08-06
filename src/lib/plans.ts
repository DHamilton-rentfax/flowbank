
import { db } from '@/firebase/client';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import type { Plan, UserPlan, AllocationRule, Account } from './types';
import { stripe } from './stripe';
import { nanoid } from './utils';


export const plans: Plan[] = [
    {
        id: "free",
        name: "Free",
        price: 0,
        features: [
            "1 connected bank account",
            "1 allocation rule",
            "Manual income allocation",
            "Community support"
        ]
    },
    {
        id: "starter",
        name: "Starter",
        price: 9,
        features: [
            "Basic income split",
            "Up to 5 allocation categories",
            "AI Plan Generator",
            "Email reports"
        ],
        stripePriceId: 'price_1PgfTkGCq4vA4vNq7z4xYp7z' // Placeholder - Replace with your actual Stripe Price ID
    },
    {
        id: "pro",
        name: "Pro",
        price: 19,
        features: [
            "Custom percentage rules",
            "Connect multiple accounts",
            "Automated income allocation",
            "Smart Forecasting (Add-on)"
        ],
        stripePriceId: 'price_1Pge5VGCq4vA4vNqgA3jRk2d' // Replace with your actual Stripe Price ID
    },
    {
        id: "business",
        name: "Business",
        price: 39,
        features: [
            "API access & webhooks",
            "Advanced reporting & exports",
            "Multi-user access (coming soon)",
            "Priority support"
        ],
        stripePriceId: 'price_1Pge5lGCq4vA4vNqlsO0vL6r' // Replace with your actual Stripe Price ID
    }
];

const initialRulesData: Omit<AllocationRule, 'id'>[] = [
    { name: 'Operating Expenses', percentage: 50 },
    { name: 'Taxes', percentage: 20 },
    { name: 'Owner Compensation', percentage: 15 },
    { name: 'Savings', percentage: 10 },
    { name: 'Marketing', percentage: 5 },
];

export const initialRulesForNewUser = (): AllocationRule[] => {
    return initialRulesData.map(rule => ({
        id: nanoid(),
        ...rule
    }));
}


export async function createUserDocument(userId: string, email: string, displayName?: string | null, planId?: string | null) {
    const userDocRef = doc(db, "users", userId);
    
    // Don't check if the document exists. 
    // This function should only be called once on signup, so we can assume it doesn't.
    // This prevents a race condition where the check happens before the auth state is fully updated.
    
    const selectedPlanId = planId || 'free';
    const plan = plans.find(p => p.id === selectedPlanId);

    if (!plan) throw new Error(`Plan with ID "${selectedPlanId}" not found.`);
    
    const stripeCustomer = await stripe.customers.create({
        email,
        name: displayName || email,
        metadata: {
            firebaseUID: userId,
        },
    });

    const userPlan: UserPlan = {
        id: plan.id,
        name: plan.name,
        status: 'active',
        stripeCustomerId: stripeCustomer.id,
    };

    const userData = {
        email,
        displayName: displayName || email,
        createdAt: new Date().toISOString(),
        stripeCustomerId: stripeCustomer.id,
        plan: userPlan,
    };

    const batch = writeBatch(db);

    // 1. Set the main user document
    batch.set(userDocRef, userData);

    // 2. Create initial rules and accounts
    const newRules = initialRulesForNewUser();
    newRules.forEach((rule) => {
        const account: Account = { id: rule.id, name: rule.name, balance: 0 };
        
        const ruleDocRef = doc(db, "users", userId, "rules", rule.id);
        batch.set(ruleDocRef, rule);

        const accountDocRef = doc(db, "users", userId, "accounts", rule.id);
        batch.set(accountDocRef, account);
    });

    await batch.commit();
}
