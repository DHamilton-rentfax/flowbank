"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createCheckoutSession } from "@/app/actions/create-checkout-session";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, X } from "lucide-react";
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
      features: {
        'Connect Bank Account': true,
        'Create and Customize Splits': true,
        'Automatic Allocations': false,
        'AI Suggestions': false,
        'Priority Support': false,
        'Weekly Insights': false,
        'Dashboard Analytics': false,
        'Multi-Bank Support': false,
        'Audit Logging': false,
        'Add-ons Available': false,
      },
      action: 'signup',
    },
    {
      title: 'Starter',
      lookupKey: 'starter_month_usd', 
      price: '$9',
      period: '/mo',
      description: 'Simple insights, simple setup.',
      features: {
        'Connect Bank Account': true,
        'Create and Customize Splits': true,
        'Automatic Allocations': 'Basic',
        'AI Suggestions': 'Simple tips',
        'Priority Support': 'Add-on',
        'Weekly Insights': true,
        'Dashboard Analytics': 'Add-on',
        'Multi-Bank Support': false,
        'Audit Logging': false,
        'Add-ons Available': true,
      },
      action: 'checkout',
    },
    {
      title: 'Pro',
      lookupKey: 'pro_month_usd',
      price: '$29',
      period: '/mo',
      description: 'Advanced features & automation.',
      features: {
        'Connect Bank Account': true,
        'Create and Customize Splits': true,
        'Automatic Allocations': 'Advanced',
        'AI Suggestions': 'Full AI Engine',
        'Priority Support': true,
        'Weekly Insights': true,
        'Dashboard Analytics': true,
        'Multi-Bank Support': true,
        'Audit Logging': true,
        'Add-ons Available': true,
      },
      action: 'checkout',
    },
  ],
  annually: [
     {
      title: 'Free',
      lookupKey: 'free',
      price: '$0',
      period: '/yr',
      description: 'For starters trying FlowBank.',
      features: {
        'Connect Bank Account': true,
        'Create and Customize Splits': true,
        'Automatic Allocations': false,
        'AI Suggestions': false,
        'Priority Support': false,
        'Weekly Insights': false,
        'Dashboard Analytics': false,
        'Multi-Bank Support': false,
        'Audit Logging': false,
        'Add-ons Available': false,
      },
      action: 'signup',
    },
    {
      title: 'Starter',
      lookupKey: 'starter_year_usd',
      price: '$90',
      period: '/yr',
      description: 'Simple insights at a discount.',
      features: {
        'Connect Bank Account': true,
        'Create and Customize Splits': true,
        'Automatic Allocations': 'Basic',
        'AI Suggestions': 'Simple tips',
        'Priority Support': 'Add-on',
        'Weekly Insights': true,
        'Dashboard Analytics': 'Add-on',
        'Multi-Bank Support': false,
        'Audit Logging': false,
        'Add-ons Available': true,
      },
      action: 'checkout',
    },
    {
      title: 'Pro',
      lookupKey: 'pro_year_usd',
      price: '$290',
      period: '/yr',
      description: 'Power users & teams at a discount.',
      features: {
        'Connect Bank Account': true,
        'Create and Customize Splits': true,
        'Automatic Allocations': 'Advanced',
        'AI Suggestions': 'Full AI Engine',
        'Priority Support': true,
        'Weekly Insights': true,
        'Dashboard Analytics': true,
        'Multi-Bank Support': true,
        'Audit Logging': true,
        'Add-ons Available': true,
      },
      action: 'checkout',
    },
  ],
};

const addOns = [
    {
        name: 'AI Optimization',
        description: "Unlock full access to FlowBank's AI Financial Advisor. Get personalized tax coaching, spending insights, subscription analysis, and savings opportunities—powered by the IRS tax code and your real transactions.",
        monthly: {
            price: '$14.00',
            lookupKey: 'addon_ai_optimization_month_usd',
        },
        annually: {
            price: '$140.00',
            lookupKey: 'addon_ai_optimization_year_usd',
        }
    },
    {
        name: 'Priority Support',
        description: 'Fast-track access to our support team with guaranteed 24h response.',
        monthly: {
          price: '$19.00',
          lookupKey: 'addon_support_month_usd',
        },
        annually: {
           price: '$190.00',
           lookupKey: 'addon_support_year_usd'
        }
    }
];

const allFeatures = [
    'Connect Bank Account',
    'Create and Customize Splits',
    'Automatic Allocations',
    'AI Suggestions',
    'Priority Support',
    'Weekly Insights',
    'Dashboard Analytics',
    'Multi-Bank Support',
    'Audit Logging',
    'Add-ons Available',
];

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingKey, setLoadingKey] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const tiers = plans[billingCycle];

  const planFromUrl = searchParams.get('plan');
  const fromLogin = searchParams.get('fromLogin');

  useEffect(() => {
    if (planFromUrl && fromLogin && user) {
        handleCheckout(planFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planFromUrl, fromLogin, user]);


  async function handleCheckout(lookup_key: string) {
    if (!user) {
        router.push(`/login?next=/pricing&plan=${lookup_key}`);
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

  const renderCheck = (value: boolean | string) => {
    if (value === true) return <Check className="h-5 w-5 text-green-500" />;
    if (value === false) return <X className="h-5 w-5 text-red-500" />;
    return <span className="text-sm text-muted-foreground">{value}</span>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl py-12 px-4">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight">Flexible Plans for Any Business</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Start for free, then choose a plan that grows with you. Switch or cancel anytime.
              </p>
            </header>

            <div className="flex items-center justify-center space-x-2 mb-10">
              <Label htmlFor="billing-cycle" className={cn(billingCycle === 'monthly' && 'text-primary')}>Monthly</Label>
              <Switch 
                id="billing-cycle" 
                checked={billingCycle === 'annually'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
              />
              <Label htmlFor="billing-cycle" className={cn(billingCycle === 'annually' && 'text-primary')}>Annually (Save ~16%)</Label>
            </div>

            {/* Pricing Table */}
            <div className="border rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                    {plans.monthly.map(p => (
                      <th key={p.title} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">{p.title}</th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map(feature => (
                    <tr key={feature} className="odd:bg-white even:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feature}</td>
                       {tiers.map((p, i) => (
                        <td key={p.title || i} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {p.title && renderCheck(p.features[feature as keyof typeof p.features])}
                        </td>
                       ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {renderCheck(true)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <th scope="row" className="px-6 py-5 text-left text-sm font-medium"></th>
                    {tiers.map((p, i) => (
                      <td key={p.title || i} className="px-6 py-5 text-center">
                        {p.title ? (
                          <>
                            <div className="text-xl font-bold mb-2">
                              {p.price} <span className="text-sm font-normal text-muted-foreground">{p.period}</span>
                            </div>
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
                          </>
                        ) : null}
                      </td>
                    ))}
                    <td className="px-6 py-5 text-center">
                         <div className="text-xl font-bold mb-2">Custom</div>
                         <Button asChild className="w-full">
                            <Link href="/contact">Contact Sales</Link>
                        </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Add-ons Marketplace */}
            <div className="mt-16">
                <header className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight">Add-on Marketplace</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Customize your Starter or Pro plan with powerful extras.
                    </p>
                </header>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {addOns.map(addon => {
                        const currentCycle = addon[billingCycle];
                        return (
                            <Card key={currentCycle.lookupKey} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{addon.name}</CardTitle>
                                    <CardDescription>{addon.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="text-2xl font-bold">{currentCycle.price}<span className="text-base font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full"
                                        disabled={!!loadingKey}
                                        onClick={() => handleCheckout(currentCycle.lookupKey)}
                                    >
                                        {loadingKey === currentCycle.lookupKey ? "Processing..." : "Add to Plan"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
