"use client";

/**
 * src/app/admin/env-diagnostics/page.tsx
 *
 * A lightweight diagnostics UI:
 * - Reads env summary via dynamic import of server action
 * - Calls /api/health/admin for live health snapshot
 */

import { useEffect, useState } from "react";

type EnvSummary = {
  FIREBASE_ADMIN_CERT_B64: boolean;
  STRIPE_SECRET_KEY: boolean;
  STRIPE_WEBHOOK_SECRET: boolean;
  PLAID_CLIENT_ID: boolean;
  PLAID_SECRET: boolean;
  PLAID_ENV: string;
  NEXT_PUBLIC_SITE_URL: string | null;
  SENDGRID_API_KEY: boolean;
};

type Health = {
  ok: boolean;
  env: { STRIPE: boolean; PLAID: boolean };
  lastStripeEvent: any;
  lastPlaidWebhook: any;
  time: string;
};

export default function EnvDiagnosticsPage() {
  const [env, setEnv] = useState<EnvSummary | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // dynamic import to keep server-only bits out of client bundle
        const admin = await import("@/app/admin/actions");
        const summary = await admin.getEnvSummary();
        setEnv(summary as any);
      } catch (e) {
        console.error(e);
      }

      try {
        const res = await fetch("/api/health/admin", { cache: "no-store" });
        const json = await res.json();
        setHealth(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Environment & Health Diagnostics</h1>

      {loading && <div>Loading…</div>}

      {env && (
        <div className="mb-6 border rounded-xl p-4">
          <h2 className="font-medium mb-2">Environment Summary</h2>
          <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>FIREBASE_ADMIN_CERT_B64: {String(env.FIREBASE_ADMIN_CERT_B64)}</li>
            <li>STRIPE_SECRET_KEY: {String(env.STRIPE_SECRET_KEY)}</li>
            <li>STRIPE_WEBHOOK_SECRET: {String(env.STRIPE_WEBHOOK_SECRET)}</li>
            <li>PLAID_CLIENT_ID: {String(env.PLAID_CLIENT_ID)}</li>
            <li>PLAID_SECRET: {String(env.PLAID_SECRET)}</li>
            <li>PLAID_ENV: {env.PLAID_ENV}</li>
            <li>NEXT_PUBLIC_SITE_URL: {env.NEXT_PUBLIC_SITE_URL || "n/a"}</li>
            <li>SENDGRID_API_KEY: {String(env.SENDGRID_API_KEY)}</li>
          </ul>
        </div>
      )}

      {health && (
        <div className="border rounded-xl p-4">
          <h2 className="font-medium mb-2">Admin Health</h2>
          <div className="text-sm space-y-1">
            <div>Firestore OK: {String(health.ok)}</div>
            <div>Stripe env configured: {String(health.env?.STRIPE)}</div>
            <div>Plaid env configured: {String(health.env?.PLAID)}</div>
            <div>Last Stripe event: {String(health.lastStripeEvent || "n/a")}</div>
            <div>Last Plaid webhook: {String(health.lastPlaidWebhook || "n/a")}</div>
            <div>Time: {health.time}</div>
          </div>
        </div>
      )}
    </div>
  );
}