
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface Plan {
    name: string;
    price: { monthly: number | null, annual: number | null };
    lookupKeys: { monthly: string | null, annual: string | null };
    features: string[];
    contact?: boolean;
    disabled?: boolean;
    ctaLabel: string;
}

interface Props {
  plan: Plan;
  billingCycle: "monthly" | "annual";
  isAddon?: boolean;
}

export function PricingCard({ plan, billingCycle, isAddon = false }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const isAnnual = billingCycle === 'annual';

  const price = isAnnual ? plan.price.annual : plan.price.monthly;
  const lookupKey = isAnnual ? plan.lookupKeys.annual : plan.lookupKeys.monthly;

  const priceText = plan.contact ? "Custom" : (price !== null ? `$${price}` : '');
  const intervalText = price !== null ? (isAnnual ? '/year' : '/month') : '';

  const handleCtaClick = () => {
    if (plan.disabled) return;
    
    if (plan.contact) {
        router.push('/contact');
        return;
    }

    if (lookupKey) {
        if (user) {
            router.push(`/checkout/${lookupKey}`);
        } else {
            router.push(`/login?next=/checkout/${lookupKey}`);
        }
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-sm flex flex-col justify-between bg-card"
      )}
    >
      <div>
        <h3 className="text-xl font-semibold text-card-foreground">{plan.name}</h3>
        
        <div className="mt-4 mb-4">
            <span className="text-3xl font-bold">{priceText}</span>
            {intervalText && <span className="text-sm font-normal text-muted-foreground">{intervalText}</span>}
        </div>

        <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              {f}
            </li>
          ))}
        </ul>
      </div>

        <Button onClick={handleCtaClick} className="w-full" disabled={plan.disabled}>
            {plan.ctaLabel}
        </Button>
    </div>
  );
}

