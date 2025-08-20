"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import server actions
const getAdminAnalytics = () => import("@/app/actions/get-admin-analytics").then(mod => mod.getAdminAnalytics);
const getInviteStats = () => import("@/app/actions/get-invite-stats").then(mod => mod.getInviteStats);
const getWebhookStatus = () => import("@/app/actions/get-webhook-status").then(mod => mod.getWebhookStatus);


interface AnalyticsData {
  activeUsers?: number;
  newUsersWeek?: number;
  paidUsers?: number;
  freeUsers?: number;
  // Add more analytics data fields as needed
}

interface InviteStats {
  pendingInvites?: number;
  acceptedInvites?: number;
  // Add more invite data fields
}

interface WebhookStatus {
  recentErrors?: number;
  lastSuccess?: string;
  // Add more webhook status fields
}


export default function AdminStatusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [inviteStats, setInviteStats] = useState<InviteStats | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Redirect non-authenticated users
      router.push("/login");
      return;
    }

    // Optional: Check for admin role if needed
    // if (user.role !== 'admin') {
    //   router.push("/dashboard");
    //   return;
    // }


    const fetchData = async () => {
      try {
        setPageLoading(true);
        setError(null);

        const [
          getAdminAnalyticsAction,
          getInviteStatsAction,
          getWebhookStatusAction,
        ] = await Promise.all([
          getAdminAnalytics(),
          getInviteStats(),
          getWebhookStatus(),
        ]);

        const [analyticsData, inviteData, webhookData] = await Promise.all([
          getAdminAnalyticsAction(),
          getInviteStatsAction(),
          getWebhookStatusAction(),
        ]);

        setAnalytics(analyticsData);
        setInviteStats(inviteData);
        setWebhookStatus(webhookData);

      } catch (err) {
        console.error("Admin status fetch error:", err);
        setError("Failed to load status data.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();

  }, [user, loading, router]); // Dependencies for useEffect

  if (loading || pageLoading) {
    return <div className="p-6 text-center">Loading status...</div>;
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  // Optional: Access denied message if not admin and check is uncommented above
  // if (user.role !== 'admin') {
  //   return <div className="p-6 text-center text-red-500">Access denied.</div>;
  // }


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Launch Status Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Metrics */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">User Overview</h2>
          <p>Active Users: {analytics?.activeUsers ?? 'N/A'}</p>
          <p>New Users This Week: {analytics?.newUsersWeek ?? 'N/A'}</p>
          <p>Paid Users: {analytics?.paidUsers ?? 'N/A'}</p>
          <p>Free Users: {analytics?.freeUsers ?? 'N/A'}</p>
        </div>

        {/* Invite Metrics */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Invite Status</h2>
          <p>Pending Invites: {inviteStats?.pendingInvites ?? 'N/A'}</p>
          <p>Accepted Invites: {inviteStats?.acceptedInvites ?? 'N/A'}</p>
        </div>

        {/* Webhook Status */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Stripe Webhook Health</h2>
          <p>Recent Errors: {webhookStatus?.recentErrors ?? 'N/A'}</p>
          <p>Last Success: {webhookStatus?.lastSuccess ?? 'N/A'}</p>
          {/* Add more webhook details if available */}
        </div>

        {/* Add more metrics sections as needed (e.g., API Usage, Storage) */}

      </div>

      {/* Add refresh button or auto-refresh */}
      {/* <div className="mt-6 text-center">
        <button onClick={() => fetchData()} className="px-4 py-2 bg-blue-600 text-white rounded">Refresh Data</button>
      </div> */}
    </div>
  );
}