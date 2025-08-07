
import { db } from '@/firebase/server';
import type { Plan, UserPlan, AllocationRule, Account, AddOn } from './types';
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
        ],
        stripePriceId: "price_1PgfTkGCq4vA4vNq7z4xYp7z" // Replace with your actual free plan price ID if you have one
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
        stripePriceId: 'price_1PgfTkGCq4vA4vNq7z4xYp7z' // Example ID
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
        stripePriceId: 'price_1Pge5VGCq4vA4vNqgA3jRk2d' // Example ID
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
        stripePriceId: 'price_1Pge5lGCq4vA4vNqlsO0vL6r' // Example ID
    }
];

export const addOns: AddOn[] = [
    {
        id: "smart_forecasting",
        name: "Smart Forecasting",
        description: "AI-powered cash flow predictions and future allocation planning based on your business habits and seasonal trends.",
        price: 6,
        stripePriceId: 'price_1PghZcGCq4vA4vNq0a1b2c3d' // Example ID
    },
    {
        id: "tax_vault",
        name: "Tax Vault",
        description: "Automatically calculate and reserve estimated tax payments in a secure sub-account.",
        price: 5,
        stripePriceId: 'price_1PghZcGCq4vA4vNq1b2c3d4e' // Example ID
    },
    {
        id: "instant_payouts",
        name: "Instant Payouts",
        description: "Access your allocated funds instantly, anytime — skip the standard 2-day wait.",
        price: 9,
        stripePriceId: 'price_1PghZcGCq4vA4vNq2c3d4e5f' // Example ID
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
