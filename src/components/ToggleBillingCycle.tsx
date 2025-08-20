"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ToggleBillingCycle({
  billingCycle,
  setBillingCycle,
}: {
  billingCycle: "monthly" | "annually";
  setBillingCycle: (cycle: "monthly" | "annually") => void;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={billingCycle}
      onValueChange={(val) => {
        if (val) setBillingCycle(val as "monthly" | "annually");
      }}
      className="inline-flex items-center bg-muted p-1 rounded-xl border"
    >
      <ToggleGroup.Item
        value="monthly"
        className={cn(
          "text-sm px-4 py-1.5 rounded-lg transition-all",
          billingCycle === "monthly"
            ? "bg-white shadow font-medium"
            : "text-muted-foreground"
        )}
      >
        Monthly
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="annually"
        className={cn(
          "text-sm px-4 py-1.5 rounded-lg transition-all",
          billingCycle === "annually"
            ? "bg-white shadow font-medium"
            : "text-muted-foreground"
        )}
      >
        Annually <span className="ml-1 text-xs">(Save ~16%)</span>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
