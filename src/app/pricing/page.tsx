
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";
import PricingCard, { type PricingPlan } from "@/components/pricing/pricing-card";
import AddonToggle from "@/components/pricing/addon-toggle";
import { BillingToggle } from "@/components/pricing/BillingToggle";

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>("month");
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pricing?interval=${interval}`);
        if (!res.ok) throw new Error('Failed to fetch pricing data');
        const { plans: fetchedPlans, addons: fetchedAddons } = await res.json();
        setPlans(fetchedPlans);
        setAddons(fetchedAddons);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, [interval]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary py-16 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-center mb-2">
            Flexible Plans for Any Business
          </h1>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start for free, then choose a plan that grows with you. All paid plans come with a 7-day free trial. Switch or cancel anytime.
          </p>
        </div>

        <BillingToggle value={interval} onChange={setInterval} />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} interval={interval} />
            ))}
          </div>
        )}


        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-2">
            Powerful Add-ons
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Customize your Starter or Pro plan with powerful extras.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {loading ? (
                <>
                 <Skeleton className="h-32 rounded-lg" />
                 <Skeleton className="h-32 rounded-lg" />
                </>
            ) : addons.map((addon) => (
              <AddonToggle key={addon.id} addon={addon} interval={interval} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
