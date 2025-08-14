
import type { Plan, AddOn } from './types';

export const plans: Plan[] = [
    {
        id: "free",
        name: "Free",
        price: 0,
        features: ["Bank linking", "Manual allocations", "Basic analytics"],
        stripePriceId: undefined
    },
    {
        id: "starter",
        name: "Starter",
        price: 9,
        features: ["Automatic allocations", "Email support"],
        stripePriceId: "price_starter_xxx" // Replace with your actual price ID
    },
    {
        id: "pro",
        name: "Pro",
        price: 29,
        features: ["AI allocations", "Advanced rules", "Priority support"],
        stripePriceId: "price_pro_xxx" // Replace with your actual price ID
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 0, // Custom pricing
        features: ["Custom setup", "SLA", "Dedicated success"],
        stripePriceId: undefined
    }
];

export const addOns: AddOn[] = [
    // Add-ons can be defined here if needed
];
