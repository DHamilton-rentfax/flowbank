tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
// Import the UpgradePrompt component
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Button } from "@/components/ui/button";
import { BillingPortalButton } from "@/components/BillingPortalButton";
import { hasFeatureAccess } from "@/lib/planFeatures";

export default function FreeDashboard() {
  const { user, loading, plan } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) redirect("/login");
  }, [loading, user]);

  if (loading || !user) return <div className="p-4">Loading...</div>;

  const userPlan = plan || "free"; // Default to free if plan is not set
  if (plan !== "free") {
    // Optionally redirect users with higher plans, or show a restricted view
    return <div className="p-4">Access restricted to Free users.</div>;
  }

 return (
 <div className="p-8 space-y-6">
 <h1 className="text-3xl font-bold">Free Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.email}. You are on the <strong>{userPlan}</strong> plan.</p>

 <div className="mt-6 space-y-4">
 <div>
 <h2 className="text-xl font-semibold">Core Features</h2>
 <ul className="list-disc list-inside space-y-2">
            {hasFeatureAccess(userPlan as any, "connect-bank") && <li>Connect a bank account</li>}
            {hasFeatureAccess(userPlan as any, "connect-bank") && <li>Set up income split rules</li>} {/* Assuming income split is tied to connect-bank */}
            {hasFeatureAccess(userPlan as any, "basic-ai") && <li>Preview AI insights (limited)</li>}
 </ul>
 </div>

 <div>
 <h2 className="text-xl font-semibold">Locked Features (Upgrade to unlock)</h2>
          {/* Gated Feature: Full AI Financial Advisor */}
          {!hasFeatureAccess(userPlan as any, "full-ai") && (
            <UpgradePrompt currentPlan={userPlan as any} requiredPlan="pro" />
          )}

          {/* Gated Feature: Priority Support */}
           {!hasFeatureAccess(userPlan as any, "priority-support") && (
            <UpgradePrompt currentPlan={userPlan as any} requiredPlan="pro" />
          )}
 </div>
      </div>
      <div className="mt-8">
        <BillingPortalButton />
      </div>
    </div>
  );
}