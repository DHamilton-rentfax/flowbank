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
tsx
"use client";

export default function ProDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">FlowBank Pro</h1>
      <ul className="list-disc ml-5 space-y-1">
        <li>Full AI financial advisor</li>
        <li>Smart tax savings & budgeting</li>
        <li>Priority support</li>
        <li>Real-time dashboard analytics</li>
      </ul>
    </div>
  );
}