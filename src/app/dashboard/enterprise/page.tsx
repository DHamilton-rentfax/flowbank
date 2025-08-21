tsx
"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function EnterpriseDashboard() {
  const { user, loading, plan } = useAuth();

  useEffect(() => {
    if (!loading && !user) redirect("/login");
  }, [loading, user]);

  if (loading || !user) return <div className="p-4">Loading...</div>;
  if (plan !== "enterprise") return <div className="p-4">Access restricted to Enterprise users.</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user.email}. You are on the <strong>Enterprise</strong> plan.</p>

      <ul className="list-disc list-inside space-y-2">
        <li>Custom AI rules and automations</li>
        <li>Team seat management</li>
        <li>Enterprise integrations (e.g. QuickBooks)</li>
        <li>SLA + onboarding support</li>
      </ul>
    </div>
  );
}