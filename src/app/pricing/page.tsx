"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * FlowBank Pricing – modern layout with plan toggle & add-ons
 *
 * Redirect behavior:
 * - Clicking "Get Started" pushes to /signup with query params for plan, billing, and add-ons.
 *   (If you prefer to go to a Checkout route, change `router.push()` accordingly.)
 *
 * Stripe lookup keys (confirmed):
 * - Free: (no Stripe price)
 * - Starter: price_starter_monthly, price_starter_annual
 * - Pro:     price_pro_monthly,     price_pro_annual
 * - AI Optimization add-on: addon_ai_optimization (monthly), addon_ai_optimization_annual (annual)
 * - Priority Support add-on: $19/mo or $191.52/yr (lookup keys to add in Stripe UI if you want to sell as add-on)
 */

type Billing = "monthly" | "annual";

const PRICES = {
  monthly: {
    free: 0,
    starter: 9.99,
    pro: 29,
  },
  annual: {
    free: 0,
    starter: 99, // ~16% off
    pro: 290,    // ~16% off
  },
};

const LOOKUP_KEYS: Record<
  Billing,
  { starter: string; pro: string; aiAddon: string; aiAddonAnnual?: string; priority?: string; priorityAnnual?: string }
> = {
  monthly: {
    starter: "price_starter_monthly",
    pro: "price_pro_monthly",
    aiAddon: "addon_ai_optimization",
    priority: "addon_priority_support_monthly", // create in Stripe if selling via add-on
  },
  annual: {
    starter: "price_starter_annual",
    pro: "price_pro_annual",
    aiAddon: "addon_ai_optimization_annual",
    priority: "addon_priority_support_annual", // create in Stripe if selling via add-on
  },
};

const ADDONS = {
  monthly: {
    ai: 14,
    priority: 19,
    seat: 5, // example: $5 per extra seat / month
  },
  annual: {
    ai: 140,
    priority: 191.52, // 16% discount from $19/mo
    seat: 50, // example: $50 / year per extra seat
  },
};

const FEATURES = [
  { key: "connect", label: "Connect Bank Account", free: true, starter: true, pro: true, enterprise: true },
  { key: "splits", label: "Create & Customize Splits", free: true, starter: true, pro: true, enterprise: true },
  { key: "autoalloc", label: "Automatic Allocations", free: false, starter: "Basic", pro: "Advanced", enterprise: true },
  { key: "ai", label: "AI Financial Advisor", free: "Limited", starter: "Simple tips", pro: "Full AI Engine", enterprise: true },
  { key: "weekly", label: "Weekly Insights", free: false, starter: true, pro: true, enterprise: true },
  { key: "analytics", label: "Dashboard Analytics", free: false, starter: "Add‑on", pro: true, enterprise: true },
  { key: "banks", label: "Multi‑Bank Support", free: false, starter: false, pro: true, enterprise: true },
  { key: "audit", label: "Audit Logging", free: false, starter: "Add‑on", pro: true, enterprise: true },
  { key: "extAccounts", label: "External Account Splits", free: "0", starter: "1", pro: "5", enterprise: "Unlimited" },
  { key: "support", label: "Priority Support", free: false, starter: "Add‑on", pro: true, enterprise: true },
];

const BADGE = ({ text }: { text: string }) => (
  <span className="ml-2 rounded-full bg-gray-900/5 px-2 py-0.5 text-xs text-gray-600">{text}</span>
);

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing>("monthly");

  // Add-ons (applies to Starter/Pro; Enterprise = contact)
  const [aiAddon, setAiAddon] = useState(false);
  const [priorityAddon, setPriorityAddon] = useState(false);
  const [extraSeats, setExtraSeats] = useState(0);

  const totals = useMemo(() => {
    const a = ADDONS[billing];
    return {
      starter: PRICES[billing].starter + (aiAddon ? a.ai : 0) + (priorityAddon ? a.priority : 0) + a.seat * extraSeats,
      pro: PRICES[billing].pro + (aiAddon ? a.ai : 0) + (priorityAddon ? a.priority : 0) + a.seat * extraSeats,
    };
  }, [billing, aiAddon, priorityAddon, extraSeats]);

  const money = (n: number) =>
    billing === "monthly" ? `$${n.toFixed(n % 1 ? 2 : 0)}/mo` : `$${n.toFixed(0)}/yr`;

  const pickPlan = (plan: "free" | "starter" | "pro" | "enterprise") => {
    if (plan === "enterprise") {
      router.push("/contact?topic=enterprise");
      return;
    }
    if (plan === "free") {
      router.push(`/signup?plan=free&billing=${billing}`);
      return;
    }

    // Pass selection via query for the signup/checkout flow to consume.
    const params = new URLSearchParams({
      plan,
      billing,
      ai: aiAddon ? "1" : "0",
      priority: priorityAddon ? "1" : "0",
      seats: String(extraSeats),
      price_lookup: LOOKUP_KEYS[billing][plan], // main plan
    });

    // Optionally send add-on lookup keys if you sell them in the same checkout:
    if (aiAddon) params.set("addon_ai", LOOKUP_KEYS[billing].aiAddon);
    if (billing === "annual" && LOOKUP_KEYS[billing].aiAddon)
      params.set("addon_ai", LOOKUP_KEYS[billing].aiAddon!);
    if (priorityAddon && LOOKUP_KEYS[billing].priority)
      params.set("addon_priority", LOOKUP_KEYS[billing].priority!);

    router.push(`/signup?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Hero */}
      <section className="mb-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Flexible Plans for Any Business</h1>
          <p className="mt-3 text-gray-600">
            Start for free, then choose a plan that grows with you. Switch or cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-white p-1">
            <button
              className={`rounded-full px-4 py-1.5 text-sm ${billing === "monthly" ? "bg-black text-white" : "text-gray-700"}`}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </button>
            <button
              className={`rounded-full px-4 py-1.5 text-sm ${billing === "annual" ? "bg-black text-white" : "text-gray-700"}`}
              onClick={() => setBilling("annual")}
            >
              Annually <span className="ml-1 opacity-70">(Save ~16%)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Free */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-600">Free</div>
          <div className="mt-2 text-4xl font-semibold">{money(PRICES[billing].free)}</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• 1 bank connection</li>
            <li>• Manual rules</li>
            <li>• Basic insights</li>
          </ul>
          <button
            onClick={() => pickPlan("free")}
            className="mt-6 w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900"
          >
            Get Started
          </button>
        </div>

        {/* Starter */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Starter</div>
            <BADGE text="Best for solo founders" />
          </div>
          <div className="mt-2 text-4xl font-semibold">{money(PRICES[billing].starter)}</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• Automated splits (basic)</li>
            <li>• 1 bank</li>
            <li>• Weekly insights</li>
            <li>• Email support</li>
          </ul>
          <button
            onClick={() => pickPlan("starter")}
            className="mt-6 w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900"
          >
            Choose Starter
          </button>
          {/* Dynamic summary with add-ons */}
          <div className="mt-3 text-xs text-gray-500">
            With selected add‑ons: <strong>{money(totals.starter)}</strong>
          </div>
        </div>

        {/* Pro */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm ring-2 ring-black/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Pro</div>
            <BADGE text="Most popular" />
          </div>
          <div className="mt-2 text-4xl font-semibold">{money(PRICES[billing].pro)}</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• Automations (advanced)</li>
            <li>• Up to 5 banks & external splits</li>
            <li>• Full AI Financial Advisor</li>
            <li>• Advanced reporting & analytics</li>
            <li>• Priority support</li>
          </ul>
          <button
            onClick={() => pickPlan("pro")}
            className="mt-6 w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900"
          >
            Choose Pro
          </button>
          <div className="mt-3 text-xs text-gray-500">
            With selected add‑ons: <strong>{money(totals.pro)}</strong>
          </div>
        </div>

        {/* Enterprise */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-600">Enterprise</div>
          <div className="mt-2 text-4xl font-semibold">Custom</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• Custom rules & integrations</li>
            <li>• Unlimited external accounts</li>
            <li>• SSO / SLA & dedicated support</li>
          </ul>
          <Link
            href="/contact?topic=enterprise"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Contact Sales
          </Link>
        </div>
      </section>

      {/* Add-ons */}
      <section className="mt-12 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Optional Add‑ons</h2>
          <p className="text-sm text-gray-600">
            Add to <span className="font-medium">Starter</span> or <span className="font-medium">Pro</span>.
            Prices shown are {billing}.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="flex items-start gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={aiAddon}
              onChange={(e) => setAiAddon(e.target.checked)}
            />
            <div>
              <div className="font-medium">AI Optimization</div>
              <div className="text-sm text-gray-600">
                Personalized savings tips, tax opportunities, and spending analysis.
              </div>
              <div className="mt-1 text-sm font-medium">{money(ADDONS[billing].ai)}</div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              className="mt-1"
              checked={priorityAddon}
              onChange={(e) => setPriorityAddon(e.target.checked)}
            />
            <div>
              <div className="font-medium">Priority Support</div>
              <div className="text-sm text-gray-600">Faster responses and dedicated assistance.</div>
              <div className="mt-1 text-sm font-medium">{money(ADDONS[billing].priority)}</div>
            </div>
          </label>

          <div className="rounded-xl border p-4">
            <div className="font-medium">Extra Team Seats</div>
            <div className="text-sm text-gray-600">
              Add more teammates beyond your plan’s included seats.
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setExtraSeats((n) => Math.max(0, n - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
                aria-label="Decrease seats"
              >
                −
              </button>
              <span className="w-8 text-center tabular-nums">{extraSeats}</span>
              <button
                onClick={() => setExtraSeats((n) => n + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
                aria-label="Increase seats"
              >
                +
              </button>
              <span className="ml-2 text-sm font-medium">{money(ADDONS[billing].seat)} each</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">Compare features</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border">
          <table className="min-w-[800px] w-full border-separate border-spacing-0 bg-white">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="w-1/3 border-b px-4 py-3 font-medium">Features</th>
                <th className="w-1/6 border-b px-4 py-3 font-medium">Free</th>
                <th className="w-1/6 border-b px-4 py-3 font-medium">Starter</th>
                <th className="w-1/6 border-b px-4 py-3 font-medium">Pro</th>
                <th className="w-1/6 border-b px-4 py-3 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {FEATURES.map((f, i) => (
                <tr key={f.key} className={i % 2 ? "bg-gray-50/30" : ""}>
                  <td className="border-b px-4 py-3">{f.label}</td>
                  {(["free", "starter", "pro", "enterprise"] as const).map((tier) => {
                    const val = (f as any)[tier];
                    const render =
                      val === true ? "✔︎" : val === false ? "—" : typeof val === "string" ? val : "—";
                    return (
                      <td key={tier} className="border-b px-4 py-3 text-gray-700">
                        {render}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="mt-12 rounded-2xl border bg-white p-6 text-sm text-gray-700">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-lg font-semibold">Questions about plans or billing?</div>
            <div className="mt-1 text-gray-600">
              Visit our <Link href="/faq" className="underline">FAQ</Link> or{" "}
              <Link href="/contact" className="underline">contact sales</Link>.
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="rounded-lg border px-4 py-2 hover:bg-gray-50">Sign in</Link>
            <Link href="/signup" className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}