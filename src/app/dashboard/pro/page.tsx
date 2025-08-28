"use client";

import { useEffect, useState } from "react";

type AnalyticsSnapshot = {
  activeUsers: number;
  paidUsers: number;
  // add fields you actually render
};

export default function ProDashboardPage() {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      // ✅ dynamic import so firebase-admin never hits the client bundle
      const { getAnalyticsSnapshot } = await import("@/app/actions/get-analytics");
      const res = await getAnalyticsSnapshot(); // this runs on the server
      if (alive) {
        setData(res);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Pro Dashboard</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card title="Active Users" value={data?.activeUsers ?? 0} />
        <Card title="Paid Users" value={data?.paidUsers ?? 0} />
        {/* render the rest */}
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl p-4 shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-medium">{value}</div>
    </div>
  );
}
