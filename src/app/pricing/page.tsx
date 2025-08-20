
"use client";

import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import PricingCard from "@/components/pricing/pricing-card";
import AddonToggle from "@/components/pricing/addon-toggle";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function PricingPage() {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [plans, setPlans] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricing() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pricing?interval=${interval}`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Failed to fetch pricing data.');
        }
        const { plans, addons } = await res.json();
        setPlans(plans);
        setAddons(addons);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        console.error("Pricing load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, [interval]);

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-secondary">
            <div className="max-w-6xl mx-auto py-16 px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">Flexible plans for growing businesses</h1>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Start for free, then add automation and AI tools as you grow.
                </p>
            </div>

            <div className="flex justify-center my-8">
                <ToggleGroup type="single" value={interval} onValueChange={(val) => val && setInterval(val as "month" | "year")}>
                <ToggleGroupItem value="month">Monthly</ToggleGroupItem>
                <ToggleGroupItem value="year">Annually (Save ~15%)</ToggleGroupItem>
                </ToggleGroup>
            </div>

            {error ? (
                <p className="text-center text-destructive">{error}</p>
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    <Skeleton className="h-96 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {plans.map((plan) => (
                    <PricingCard key={plan.id} plan={plan} interval={interval} />
                ))}
                </div>
            )}

            {addons.length > 0 && !loading && !error && (
                <div className="mt-16">
                    <h2 className="text-3xl font-bold mb-6 text-center">Enhance Your Plan with Add-ons</h2>
                    <div className="max-w-3xl mx-auto grid grid-cols-1 gap-4">
                        {addons.map((addon) => (
                            <AddonToggle key={addon.id} addon={addon} interval={interval} />
                        ))}
                    </div>
                </div>
            )}
            </div>
        </main>
        <Footer />
    </div>
  );
}
