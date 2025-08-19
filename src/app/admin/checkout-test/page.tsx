
"use client";

import React, { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createCheckoutSession } from '@/app/actions/create-checkout-session';
import { useRouter } from 'next/navigation';

export default function AdminCheckoutTestPage() {
    const [loading, setLoading] = useState(''); // Store ID of plan being loaded
    const { toast } = useToast();
    const { user } = useAuth();
    const router = useRouter();

    async function handleCheckout(lookup_key: string) {
        if (!user) {
            toast({ title: "Not Authenticated", description: "Please sign in to test checkout.", variant: "destructive" });
            router.push('/login?next=/admin/checkout-test');
            return;
        }
        setLoading(lookup_key);
        try {
            const { url, error } = await createCheckoutSession([{ lookup_key }]);
            if (url) {
                window.location.href = url;
            } else {
                throw new Error(error || "Could not create checkout session.");
            }
        } catch (e) {
            const error = e as Error;
            toast({ title: "Checkout Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading('');
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-8">
                <div className="container mx-auto max-w-lg">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin: Test Checkout</CardTitle>
                            <CardDescription>Use this page to test the Stripe checkout flow for different plans.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Pro Plan (Monthly)</h3>
                                    <p className="text-sm text-muted-foreground">$29/month</p>
                                </div>
                                <Button 
                                    onClick={() => handleCheckout('pro_month_usd')}
                                    disabled={loading === 'pro_month_usd'}
                                >
                                    {loading === 'pro_month_usd' ? 'Processing...' : 'Test Checkout'}
                                </Button>
                            </div>
                             <div className="flex justify-between items-center p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Pro Plan (Yearly)</h3>
                                    <p className="text-sm text-muted-foreground">$290/year</p>
                                </div>
                                <Button 
                                    onClick={() => handleCheckout('pro_year_usd')}
                                    disabled={loading === 'pro_year_usd'}
                                >
                                    {loading === 'pro_year_usd' ? 'Processing...' : 'Test Checkout'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
