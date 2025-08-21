tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EnterpriseDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to the Enterprise Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Custom Rules Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Set custom financial rules tailored to your team or organization.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/rules")}>
              Manage Rules
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Invite and manage team members with permission control and seat limits.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/team")}>
              Manage Team
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Connect external tools and APIs to automate workflows and reporting.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/integrations")}>
              View Integrations
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Level Agreement (SLA)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Access high-priority support and uptime monitoring for your organization.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/support")}>
              Support Center
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Leverage our AI advisor to review financial performance and suggest optimizations.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/ai")}>
              Open AI Advisor
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit & Billing Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Track team actions, subscription changes, and financial audits.</p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/audit-log")}>
              View Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}