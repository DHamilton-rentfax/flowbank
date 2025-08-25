"use server";

// Minimal stub; replace with Stripe / Logs check later.
export async function getWebhookStatus() {
  return {
    status: "ok" as const, // 'ok' | 'degraded' | 'down'
    lastEventAt: new Date().toISOString(),
  };
}