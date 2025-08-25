"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

type CreateLinkTokenResponse = { link_token?: string; error?: string };
type ExchangeResponse = { ok?: boolean; error?: string };

export default function OnboardingPage() {
  const { user } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const createLink = async () => {
    if (!user?.uid) {
      setError("You must be signed in.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      const data = (await res.json().catch(() => ({}))) as CreateLinkTokenResponse;
      if (!res.ok || !data.link_token) {
        throw new Error(data.error || "Failed to create link token");
      }
      setLinkToken(data.link_token);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const exchangePublicToken = async (publicToken: string) => {
    if (!user?.uid) {
      setError("You must be signed in.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/plaid/exchange-public-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, publicToken }),
      });
      const data = (await res.json().catch(() => ({}))) as ExchangeResponse;
      if (!res.ok) throw new Error(data.error || "Failed to exchange token");
      // success logic here…
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Onboarding</h1>

      <button
        type="button"
        onClick={createLink}
        className="rounded border px-3 py-2"
        disabled={busy}
      >
        {busy ? "Working..." : "Create Link Token"}
      </button>

      {linkToken && (
        <div className="rounded bg-muted p-3 text-xs break-all">{linkToken}</div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}