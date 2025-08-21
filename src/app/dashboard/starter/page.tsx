tsx
"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { UpgradePrompt } from "@/components/UpgradePrompt"; // Import UpgradePrompt
import { hasFeature } from "@/lib/feature-gates"; // Import hasFeature

export default function StarterDashboard() {
  const { user, loading, plan } = useAuth();

  useEffect(() => {
    if (!loading && !user) redirect("/login");
  }, [loading, user]);

  if (loading || !user) return <div className="p-4">Loading...</div>;
  if (plan !== "starter") return <div className="p-4">Access restricted to Starter users.</div>;
 const userPlan = plan || "free"; // Default to free if plan is not set
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Starter Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.email}. You are on the <strong>Starter</strong> plan.</p>

      <div className="mt-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Core Features</h2>
          <ul className="list-disc list-inside space-y-2">
            {hasFeature(userPlan, "incomeSplitSetup") && <li>Bank account linking</li>}
            {hasFeature(userPlan, "incomeSplitSetup") && <li>Automated income splitting</li>}
            {hasFeature(userPlan, "aiFinancialAdvisorLite") && <li>Weekly financial insights</li>}
            {hasFeature(userPlan, "aiFinancialAdvisorLite") && <li>Simple AI suggestions</li>}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Locked Features (Upgrade to unlock)</h2>
          {/* Gated Feature: Full AI Financial Advisor */}
          {!hasFeature(userPlan, "aiFinancialAdvisorFull") && (
            <UpgradePrompt currentPlan={userPlan as any} requiredPlan="pro" />
          )}

          {/* Gated Feature: Priority Support */}
          {!hasFeature(userPlan, "prioritySupport") && (
            <UpgradePrompt currentPlan={userPlan as any} requiredPlan="pro" />
          )}

          {/* Gated Feature: Dashboard Analytics */}
          {!hasFeature(userPlan, "dashboardAnalytics") && (
            <UpgradePrompt currentPlan={userPlan as any} requiredPlan="pro" />
          )}

          {/* Gated Feature: Custom Integrations */}
          {!hasFeature(userPlan, "customIntegrations") && (
            <UpgradePrompt currentPlan={userPlan as any} requiredPlan="enterprise" />
          )}

          {/* Gated Feature: Team Management */}
          {!hasFeature(userPlan, "teamManagement") && (
            <UpgradePrompt currentPlan={userPlan as any} requiredPlan="enterprise" />
          )}
          {/* Removed the static locked features list as it's handled by UpgradePrompt */}
          {/*
            <div className="flex items-center">
              <span className="mr-2">🔒</span>Full AI Financial Advisor access
            </div>
             <div className="flex items-center">
              <span className="mr-2">🔒</span>Priority email support
            </div>
            <div className="flex items-center">
              <span className="mr-2">🔒</span>Dashboard analytics & reporting
            </div>
             <div className="flex items-center">
              <span className="mr-2">🔒</span>Custom Integrations
            </div>
             <div className="flex items-center">
              <span className="mr-2">🔒</span>Team Management
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  );
}