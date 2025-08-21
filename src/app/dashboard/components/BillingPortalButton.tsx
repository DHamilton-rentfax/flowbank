"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export default function BillingPortalButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/portal");
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError("Failed to create billing portal session.");
        }
      } catch (err) {
        setError("An error occurred.");
        console.error(err);
      }
    });
  };

  return (
    <>
      <Button onClick={handleManageBilling} disabled={isPending}>
        {isPending ? "Loading..." : "Manage Billing"}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}
'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function BillingPortalButton() {
  const { user } = useAuth()
  const router = useRouter()

  const handleClick = async () => {
    if (!user?.uid) return
    const { createPortalSession } = await import('@/app/actions/create-portal-session')
    const url = await createPortalSession(user.uid)
    if (url) {
      window.location.href = url
    } else {
      alert('No billing portal available.')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Manage Billing
    </button>
  )
}