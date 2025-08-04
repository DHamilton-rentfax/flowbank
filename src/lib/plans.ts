
import { db } from '@/firebase/client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { Plan } from './types';

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
        ]
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
        ]
    }
];

export async function createUserDocument(userId: string, email: string, displayName?: string | null) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        const freePlan = plans.find(p => p.id === 'free');
        if (!freePlan) throw new Error("Free plan not found.");

        const userData = {
            email,
            displayName: displayName || email,
            createdAt: new Date().toISOString(),
            plan: {
                id: freePlan.id,
                name: freePlan.name,
                status: 'active' // can be 'active', 'trialing', 'cancelled'
            },
        };

        await setDoc(userDocRef, userData);
    }
}
