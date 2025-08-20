
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/app/actions/create-checkout-session";

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  lookup_key: string;
  cta?: string;
  highlight?: boolean;
}

interface Props {
  plan: PricingPlan;
  billingPeriod: "month" | "year";
  onSelect?: (lookupKey: string) => void;
}

export function PricingCard({ plan, billingPeriod, onSelect }: Props) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/login?next=/pricing`);
      return;
    }
    if (!plan.lookup_key) {
      toast({
        title: "Not purchasable",
        description: "This plan cannot be purchased directly. Please contact sales.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { url, error } = await createCheckoutSession([
        { lookup_key: plan.lookup_key },
      ]);
      if (error) throw new Error(error);
      if (url) router.push(url);
    } catch (e) {
      const err = e as Error;
      toast({
        title: "Checkout Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-sm flex flex-col justify-between",
        plan.highlight ? "border-primary shadow-md bg-muted/10" : "border-muted"
      )}
    >
      <div>
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <p className="text-muted-foreground mb-4">{plan.description}</p>
        <div className="text-3xl font-bold mb-2">{plan.price}</div>

        <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <Button
        className="mt-4 w-full"
        disabled={loading}
        onClick={handleCheckout}
      >
        {loading ? "Processing..." : (plan.cta || "Get Started")}
      </Button>
    </div>
  );
}

