
"use client";

import { useApp } from "@/contexts/app-provider";
import { AllocationRules } from "./allocation-rules";
import { AIPlanGenerator } from "./ai-plan-generator";
import { useState, useEffect } from "react";
import type { AllocationRule } from "@/lib/types";
import { PlaidIntegration } from "./plaid-integration";
import { UserProfile } from "./user-profile";
import { StripeConnect } from "./stripe-connect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwoFactorAuth } from "./two-factor-auth";
import { AddOns } from "./add-ons";
import { UserManagement } from "./user-management";

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
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="profile">Profile & Plan</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="add-ons">Add-ons</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <UserProfile />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <PlaidIntegration />
                    <StripeConnect />
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
            <AddOns />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
             <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <TwoFactorAuth />
                </div>
             </div>
        </TabsContent>
         {isAdmin && (
            <TabsContent value="admin" className="mt-6">
                <UserManagement />
            </TabsContent>
         )}
      </Tabs>
    </div>
  );
}
