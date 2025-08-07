
import { db } from '@/firebase/server';
import type { Plan, UserPlan, AllocationRule, Account, AddOn } from './types';
import { stripe } from './stripe';
import { nanoid } from './utils';


export const plans: Plan[] = [
    {
        id: "free",
        name: "Free",
        price: 0,
        features: [], // Features are now defined on the pricing page
        stripePriceId: undefined 
    },
    {
        id: "starter",
        name: "Starter",
        price: 12,
        features: [],
        stripePriceId: 'price_1Pge5VGCq4vA4vNqgA3jRk2d' // Replace with your actual Starter plan price ID
    },
    {
        id: "pro",
        name: "Pro",
        price: 29,
        features: [],
        stripePriceId: 'price_1Pge5lGCq4vA4vNqlsO0vL6r' // Replace with your actual Pro plan price ID
    },
    {
        id: "business",
        name: "Business",
        price: 59,
        features: [],
        stripePriceId: 'price_1PghZcGCq4vA4vNqABCDEF12' // Replace with your actual Business plan price ID
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
