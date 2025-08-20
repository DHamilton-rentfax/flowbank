
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export interface PricingPlan {
  name: string;
  lookup_key: string;
  description: string | null;
  features: string[];
  amount: number;
  highlight?: boolean;
  customLabel?: string;
}

interface Props {
  plan: PricingPlan;
  interval: "month" | "year";
}

export default function PricingCard({ plan, interval }: Props) {
  const { user } = useAuth();

  const priceText = plan.customLabel
    ? plan.customLabel
    : `$${plan.amount}`;

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-sm flex flex-col justify-between bg-card",
        plan.highlight ? "border-primary shadow-lg" : "border-muted"
      )}
    >
      <div>
        <h3 className="text-xl font-semibold text-card-foreground">{plan.name}</h3>
        <p className="text-muted-foreground mt-1 mb-4 h-10">{plan.description}</p>
        <div className="text-3xl font-bold mb-2 text-card-foreground">{priceText}
            {plan.interval && !plan.customLabel && <span className="text-sm font-normal text-muted-foreground">/{interval}</span>}
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

        <Button asChild className="w-full" variant={plan.highlight ? 'default' : 'secondary'}>
            <Link href={plan.lookup_key ? `/checkout/${plan.lookup_key}` : '/contact'}>
                {user ? 'Choose Plan' : 'Sign up to Subscribe'}
            </Link>
        </Button>
    </div>
  );
}

