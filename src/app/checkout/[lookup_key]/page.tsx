"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';

// In a real app, you might fetch this from an API or have it in a shared config
const getPlanDetails = (lookupKey: string) => {
    if (lookupKey.includes('starter_month')) return { name: 'Starter Plan', price: '$9', interval: 'per month' };
    if (lookupKey.includes('starter_year')) return { name: 'Starter Plan', price: '$90', interval: 'per year' };
    if (lookupKey.includes('pro_month')) return { name: 'Pro Plan', price: '$29', interval: 'per month' };
    if (lookupKey.includes('pro_year')) return { name: 'Pro Plan', price: '$290', interval: 'per year' };
    if (lookupKey.includes('addon_ai_optimization_month')) return { name: 'AI Optimization Add-on', price: '$14', interval: 'per month' };
    if (lookupKey.includes('addon_ai_optimization_year')) return { name: 'AI Optimization Add-on', price: '$140', interval: 'per year' };
    if (lookupKey.includes('addon_support_month')) return { name: 'Priority Support Add-on', price: '$19', interval: 'per month' };
    if (lookupKey.includes('addon_support_year')) return { name: 'Priority Support Add-on', price: '$190', interval: 'per year' };
    return { name: 'Selected Plan', price: '---', interval: '' };
};

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const [isPending, startTransition] = useTransition();
    const lookup_key = params.lookup_key as string;
    const planDetails = getPlanDetails(lookup_key);

    const handleProceedToPayment = () => {
        if (!user) {
            toast({ title: "Not Authenticated", description: "Please sign in to complete your purchase.", variant: "destructive" });
            router.push(`/login?next=/checkout/${lookup_key}`);
            return;
        }

        startTransition(async () => {
            try {
                const auth = getAuth();
                const idToken = await auth.currentUser?.getIdToken();

                if (!idToken) throw new Error("Authentication required.");

                const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ lookupKey: lookup_key }),
                });

                const { url, error } = await res.json();

                if (error) throw new Error(error);
                if (url) {
                    router.push(url);
                } else {
                    throw new Error("Could not create checkout session.");
                }
            } catch (e) {
                const error = e as Error;
                toast({ title: "Checkout Error", description: error.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-12">
                <div className="container mx-auto max-w-lg">
                    <div className="mb-4">
                        <Button asChild variant="ghost">
                            <Link href="/pricing">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Pricing
                            </Link>
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Confirm Your Subscription</CardTitle>
                            <CardDescription>You are about to subscribe to the plan below. Review the details and proceed to payment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center p-4 border rounded-lg bg-background">
                                <div>
                                    <h3 className="font-semibold text-lg">{planDetails.name}</h3>
                                    <p className="text-sm text-muted-foreground">{planDetails.interval}</p>
                                </div>
                                <p className="text-2xl font-bold">{planDetails.price}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleProceedToPayment} disabled={isPending} className="w-full">
                                {isPending ? "Processing..." : "Proceed to Payment"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
