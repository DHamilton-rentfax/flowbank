
"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/contexts/app-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Lock } from "lucide-react";

type PlanGateProps = {
    children: React.ReactNode;
} & ({
    required: 'free' | 'starter' | 'pro' | 'enterprise';
    feature?: never;
} | {
    required?: never;
    feature: string;
});


export default function PlanGate({ required, feature, children }: PlanGateProps) {
  const { userPlan, features } = useApp();
  const currentPlan = userPlan?.id || 'free';

  const priority: { [key: string]: number } = { free: 0, starter: 1, pro: 2, enterprise: 3 };
  
  let isAllowed = false;
  let requiredEntity = '';
  let entityType = '';

  if (feature) {
    isAllowed = !!features[feature];
    requiredEntity = feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + " Add-on";
    entityType = "add-on";
  } else if (required) {
    isAllowed = priority[currentPlan] >= priority[required];
    requiredEntity = `${required} plan or higher`;
    entityType = "plan";
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
      <Card className="bg-secondary/50 border-dashed">
          <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Upgrade Required</CardTitle>
                <CardDescription>
                    This feature requires the <span className="font-bold capitalize">{requiredEntity}</span>.
                </CardDescription>
              </div>
          </CardHeader>
          <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Your current plan is <span className="font-bold capitalize">{currentPlan}</span>. Please upgrade to access this functionality.</p>
              <Button asChild>
                <Link href="/pricing">View Plans & Add-ons</Link>
              </Button>
          </CardContent>
      </Card>
  );
}
