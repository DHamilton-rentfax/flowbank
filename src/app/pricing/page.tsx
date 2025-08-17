
"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createCheckoutSession } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


const plans = {
  monthly: [
    {
      title: 'Free',
      lookupKey: 'free',
      price: '$0',
      period: '/mo',
      description: 'For starters trying FlowBank.',
      features: [
        'Connect 1 bank account',
        'Manual allocations',
        'Basic support',
      ],
      action: 'signup',
    },
    {
      title: 'Starter',
      lookupKey: 'starter_month_usd', 
      price: '$9',
      period: '/mo',
      description: 'Simple insights, simple setup.',
      features: [
        'Everything in Free',
        'Automatic allocations',
        'Weekly insights',
        'AI suggestions (lite)',
      ],
      action: 'checkout',
    },
    {
      title: 'Pro',
      lookupKey: 'pro_month_usd',
      price: '$29',
      period: '/mo',
      description: 'Advanced features & automation.',
      features: [
        'Everything in Starter',
        'AI suggestions',
        'Dashboard analytics',
        'Priority support',
      ],
      action: 'checkout',
    },
  ],
  annually: [
     {
      title: 'Starter',
      lookupKey: 'starter_year_usd',
      price: '$90',
      period: '/yr',
      description: 'Simple insights at a discount.',
      features: [
        'Everything in Free',
        'Automatic allocations',
        'Weekly insights',
        'AI suggestions (lite)',
        '2 months free',
      ],
      action: 'checkout',
    },
    {
      title: 'Pro',
      lookupKey: 'pro_year_usd',
      price: '$290',
      period: '/yr',
      description: 'Power users & teams at a discount.',
      features: [
        'Everything in Starter',
        'AI suggestions',
        'Dashboard analytics',
        'Priority support',
        '2 months free',
      ],
      action: 'checkout',
    },
  ],
};


export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loadingKey, setLoadingKey] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const tiers = plans[billingCycle];

  async function handleCheckout(lookup_key: string) {
    if (!user) {
        router.push('/login?next=/pricing');
        return;
    }
    setLoadingKey(lookup_key);
    try {
        const { url, error } = await createCheckoutSession([{ lookup_key }]);
        if (url) {
            window.location.href = url;
        } else {
            throw new Error(error || "Could not create a checkout session.");
        }
    } catch(e) {
        const error = e as Error;
        toast({title: "Checkout Error", description: error.message, variant: "destructive"});
    } finally {
        setLoadingKey('');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl py-12 px-4">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight">Pricing Plans</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Choose the plan that's right for your business.
              </p>
            </header>

            <div className="flex items-center justify-center space-x-2 mb-10">
              <Label htmlFor="billing-cycle" className={cn(billingCycle === 'monthly' && 'text-primary')}>Monthly</Label>
              <Switch 
                id="billing-cycle" 
                checked={billingCycle === 'annually'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
              />
              <Label htmlFor="billing-cycle" className={cn(billingCycle === 'annually' && 'text-primary')}>Annually</Label>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-center">
                {tiers.map((p) => (
                <Card key={p.lookupKey} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{p.title}</CardTitle>
                        <CardDescription>{p.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="text-3xl font-bold">
                            {p.price}
                            <span className="text-base font-normal text-muted-foreground">{p.period}</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                        {p.features.map(f => (
                            <li key={f} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500"/>
                                {f}
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                      {p.action === 'checkout' ? (
                          <Button 
                              className="w-full"
                              disabled={!!loadingKey}
                              onClick={() => handleCheckout(p.lookupKey)}
                          >
                              {loadingKey === p.lookupKey ? "Processing..." : "Get Started"}
                          </Button>
                      ) : (
                          <Button asChild className="w-full" variant="outline">
                            <Link href="/login">Get Started</Link>
                          </Button>
                      )}
                    </CardFooter>
                </Card>
                ))}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Enterprise</CardTitle>
                        <CardDescription>Custom solutions for teams & orgs.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="text-3xl font-bold">
                           Custom
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/>Advanced rule automation</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/>SLA & dedicated success</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/>Custom integrations</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" variant="secondary">
                            <Link href="/contact">Contact Sales</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
