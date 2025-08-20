
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ToggleBillingCycle({
  billingCycle,
  setBillingCycle,
}: {
  billingCycle: "month" | "year";
  setBillingCycle: (cycle: "month" | "year") => void;
}) {
  const isAnnual = billingCycle === "year";

  const handleToggle = (checked: boolean) => {
    setBillingCycle(checked ? "year" : "month");
  };

  return (
    <div className="flex items-center space-x-3">
      <Label htmlFor="billing-toggle" className={cn("font-medium", !isAnnual ? "text-primary" : "text-muted-foreground")}>
        Monthly
      </Label>
      <Switch
        id="billing-toggle"
        checked={isAnnual}
        onCheckedChange={handleToggle}
        aria-label="Toggle billing cycle"
      />
      <Label htmlFor="billing-toggle" className={cn("font-medium", isAnnual ? "text-primary" : "text-muted-foreground")}>
        Annually <span className="text-xs font-normal text-accent">(Save ~16%)</span>
      </Label>
    </div>
  );
}
