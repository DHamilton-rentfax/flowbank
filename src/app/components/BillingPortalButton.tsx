"use client";

import { useState } from "react";

export default function BillingPortalButton({
  customerId,
  returnUrl,
  className = "",
  children = "Manage billing",
}: {
  customerId: string | null | undefined;
  returnUrl?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    if (!customerId) {
      alert("No Stripe customer id found for this account.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/billing/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ customerId, returnUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portal error");
      window.location.href = data.url;
    } catch (e: any) {
      alert(e.message || "Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={openPortal} className="px-3 py-2 border rounded-md" disabled={loading}>
      {loading ? "Opening..." : "Manage Billing"}
    </button>
  );
}