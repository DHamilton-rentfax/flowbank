
"use client";

import { useApp } from "@/contexts/app-provider";
import { AllocationRules } from "./allocation-rules";
import { AIPlanGenerator } from "./ai-plan-generator";
import { useState, useEffect, Suspense } from "react";
import type { AllocationRule } from "@/lib/types";
import { UserProfile } from "./user-profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

const AddOns = dynamic(() => import('./add-ons').then(mod => mod.AddOns), {
    loading: () => <Skeleton className="h-64" />,
    ssr: false,
});

const TwoFactorAuth = dynamic(() => import('./two-factor-auth').then(mod => mod.TwoFactorAuth), {
    loading: () => <Skeleton className="h-48" />,
    ssr: false,
});

const PlaidIntegration = dynamic(() => import('./plaid-integration').then(mod => mod.PlaidIntegration), {
    loading: () => <Skeleton className="h-40" />,
    ssr: false,
});

const StripeConnect = dynamic(() => import('./stripe-connect').then(mod => mod.StripeConnect), {
    loading: () => <Skeleton className="h-40" />,
    ssr: false,
});

export function SettingsClient() {
  const { rules, updateRules: saveRules, userPlan } = useApp();
  const [currentRules, setCurrentRules] = useState<AllocationRule[]>(rules);

  const isAdmin = userPlan?.role === 'admin';

  // This effect synchronizes the local state with the context state
  // when the context data is loaded from Firestore.
  useEffect(() => {
    setCurrentRules(rules);
  }, [rules]);

  const handleUpdateRules = (newRules: AllocationRule[]) => {
    setCurrentRules(newRules);
  };
  
  const handleSave = () => {
    saveRules(currentRules);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile & Plan</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="add-ons">Add-ons</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <UserProfile />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Suspense fallback={<Skeleton className="h-40" />}>
                        <PlaidIntegration />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-40" />}>
                        <StripeConnect />
                    </Suspense>
                </div>
            </div>
        </TabsContent>
        <TabsContent value="allocations" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                <AllocationRules 
                    rules={currentRules} 
                    setRules={handleUpdateRules}
                    onSave={handleSave}
                />
                </div>
                <div className="lg:col-span-1 space-y-6">
                <AIPlanGenerator onApplyRules={handleUpdateRules} />
                </div>
            </div>
        </TabsContent>
         <TabsContent value="add-ons" className="mt-6">
            <Suspense fallback={<Skeleton className="h-64" />}>
                <AddOns />
            </Suspense>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
             <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Suspense fallback={<Skeleton className="h-48" />}>
                      <TwoFactorAuth />
                    </Suspense>
                </div>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
