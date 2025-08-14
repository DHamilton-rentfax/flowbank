
"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createCheckoutSession } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { plans, addOns } from "@/lib/plans";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(''); // Store ID of plan being loaded
  const pricingTiers = [...plans, ...addOns];

  async function checkout(planId: string) {
    if (!user) {
        router.push('/login');
        return;
    }
    setLoading(planId);
    try {
        const { url } = await createCheckoutSession(planId);
        if (url) {
            window.location.href = url;
        }
    } catch(e) {
        const error = e as Error;
        toast({title: "Checkout Error", description: error.message, variant: "destructive"});
    } finally {
        setLoading('');
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary">
        <div className="container mx-auto max-w-6xl py-12 px-4">
            <h1 className="text-3xl font-bold text-center mb-2">Pricing Plans</h1>
            <p className="text-muted-foreground text-center mb-8">Choose the plan that's right for your business.</p>

            <div className="grid md:grid-cols-3 gap-6">
                {pricingTiers.map(p => (
                <Card key={p.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-baseline">
                            {p.name}
                            <span className="text-2xl font-bold">${p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                        {p.features.map(f => (
                            <li key={f} className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M20 6 9 17l-5-5"/></svg>
                                {f}
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full"
                            disabled={!!loading}
                            onClick={() => p.id === "enterprise" ? window.location.href="mailto:hello@flowbank.app" : checkout(p.id)}
                        >
                            {loading === p.id ? "Redirecting..." : p.id === "enterprise" ? "Contact Sales" : "Get Started"}
                        </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
