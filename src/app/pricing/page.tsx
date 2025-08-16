
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
import Link from "next/link";
import { Check } from "lucide-react";

export default function Pricing() {
  const { user, idToken } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(''); // Store ID of plan being loaded

  const pricingTiers = [
      { id: "pro_month_usd", name: "Pro", price: 29, freq: "/mo", features: ["Automatic allocations", "AI suggestions", "Priority support"], action: "checkout" },
      { id: "pro_year_usd", name: "Pro", price: 290, freq: "/yr", features: ["All Pro features", "2 months free"], action: "checkout" },
      { id: "enterprise_month_usd", name: "Enterprise", price: 249, freq: "/mo", features: ["Advanced rule automation", "SLA & dedicated success", "Custom integrations"], action: "contact" },
  ];

  async function checkout(lookup_key: string) {
    if (!user || !idToken) {
        router.push('/login?next=/pricing');
        return;
    }
    setLoading(lookup_key);
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
                            <span className="text-2xl font-bold">${p.price}<span className="text-sm font-normal text-muted-foreground">{p.freq}</span></span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                        {p.features.map(f => (
                            <li key={f} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary"/>
                                {f}
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                      {p.action === 'checkout' ? (
                          <Button 
                              className="w-full"
                              disabled={!!loading}
                              onClick={() => checkout(p.id)}
                          >
                              {loading === p.id ? "Redirecting..." : "Get Started"}
                          </Button>
                      ) : (
                          <Button asChild className="w-full" variant="outline">
                            <Link href="/contact">Contact Sales</Link>
                          </Button>
                      )}
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
