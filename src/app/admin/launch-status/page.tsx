"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Assuming these components exist for displaying stats and webhook status
const StatCard = dynamic(() => import("@/components/admin/StatCard"));
const WebhookStatus = dynamic(() => import("@/components/admin/WebhookStatus"));

interface AnalyticsData {
  totalUsers?: number;
  newUsersLast7Days?: number;
  paidUsers?: number;
  freeUsers?: number;
  pendingInvites?: number;
  acceptedInvites?: number;
  recentWebhookErrors?: any[];
}

export default function LaunchStatusPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getAdminAnalyticsSnapshot } = await import("@/app/actions/get-admin-analytics-snapshot");
        const data = await getAdminAnalyticsSnapshot();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        // Optionally set an error state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading Launch Status...</div>;
  }

  if (!analytics) {
    return <div className="p-6 text-red-600">Failed to load analytics data.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Launch Status Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={analytics.totalUsers} />
        <StatCard title="New Users (7 Days)" value={analytics.newUsersLast7Days} />
        <StatCard title="Paid Users" value={analytics.paidUsers} />
        <StatCard title="Free Users" value={analytics.freeUsers} />
        <StatCard title="Pending Invites" value={analytics.pendingInvites} />
        <StatCard title="Accepted Invites" value={analytics.acceptedInvites} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Stripe Webhook Status</h2>
        <WebhookStatus errors={analytics.recentWebhookErrors} />
      </div>
    </div>
  );
}