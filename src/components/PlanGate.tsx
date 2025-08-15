
"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/contexts/app-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

interface PlanGateProps {
    plan: string;
    required: 'free' | 'starter' | 'pro' | 'enterprise';
    children: React.ReactNode;
}

export default function PlanGate({ required = "starter", children }: { required: 'free' | 'starter' | 'pro' | 'enterprise', children: React.ReactNode }) {
  const { userPlan } = useApp();
  const currentPlan = userPlan?.id || 'free';

  const priority: { [key: string]: number } = { free: 0, starter: 1, pro: 2, enterprise: 3 };
  
  const isAllowed = priority[currentPlan] >= priority[required];

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
      <Card className="bg-secondary">
          <CardHeader>
              <CardTitle>Upgrade Required</CardTitle>
              <CardDescription>
                  This feature requires the <span className="font-bold capitalize">{required}</span> plan or higher.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Your current plan is <span className="font-bold capitalize">{currentPlan}</span>. Please upgrade to access this functionality.</p>
              <Button asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
          </CardContent>
      </Card>
  );
}
