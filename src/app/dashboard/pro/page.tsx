import dynamic from "next/dynamic";
const BillingPortalButton = dynamic(() => import("../../components/BillingPortalButton").catch(() => Promise.resolve(() => null)), { ssr: false });

export default function ProDash() {
 return (
 <div className="space-y-4">
 <h1 className="text-2xl font-semibold">Pro Plan</h1>
 <p>Full AI engine + priority support + analytics.</p>
 <div className="grid md:grid-cols-2 gap-4">
 <div className="rounded-lg border p-4 bg-white">
 <h2 className="font-medium mb-2">AI Financial Advisor</h2>
 <p>Run analysis on recent transactions and view suggestions.</p>
 <a href="/reporting" className="text-blue-600 underline">Open Analytics</a>
 </div>
 <div className="rounded-lg border p-4 bg-white">
 <h2 className="font-medium mb-2">Splits</h2>
 <p>Create & manage up to 5 external accounts.</p>
 <a href="/splits" className="text-blue-600 underline">Manage Splits</a>
 </div>
 </div>
 <BillingPortalButton />
 </div>
 );
}
"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function ProDashboard() {
  const { user, loading, plan } = useAuth();

  useEffect(() => {
    if (!loading && !user) redirect("/login");
  }, [loading, user]);

  if (loading || !user) return <div className="p-4">Loading...</div>;
  if (plan !== "pro") return <div className="p-4">Access restricted to Pro users.</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Pro Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.email}. You are on the <strong>Pro</strong> plan.</p>

      <ul className="list-disc list-inside space-y-2">
        <li>All Starter features</li>
        <li>Full AI Financial Advisor access</li>
        <li>Priority email support</li>
        <li>Dashboard analytics & reporting</li>
        <li>Feature updates and beta access</li>
      </ul>
    </div>
  );
}