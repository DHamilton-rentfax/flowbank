import Link from "next/link";

export const metadata = {
  title: "How FlowBank Works",
  description:
    "Connect your bank, set smart rules, and let FlowBank automate your allocations with AI insights and weekly reports.",
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight">How FlowBank Works</h1>
        <p className="mt-3 text-gray-600">
          Connect your bank, set your income split rules, and let FlowBank automate allocations—while our AI
          surfaces savings, tax opportunities, and weekly insights.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-900"
          >
            Get started free
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* Stepper */}
      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {[
          {
            emoji: "🔗",
            title: "Connect your bank",
            body:
              "Securely connect via Plaid. We never store your credentials. Read-only access for analysis; allocations use your rules.",
          },
          {
            emoji: "⚙️",
            title: "Create your splits",
            body:
              "Define rules for taxes, savings, operations, marketing—whatever you need. Choose percentages and thresholds.",
          },
          { emoji: "🤖",
            title: "Automate allocations",
            body:
              "On each deposit, FlowBank routes funds to the right buckets automatically—no spreadsheets, no manual math.",
          },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-3xl">{s.emoji}</div>
            <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{s.body}</p>
          </div>
        ))}
      </section>

      {/* AI + Insights */}
      <section className="mt-12 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">AI Financial Advisor</h2>
            <p className="mt-2 text-gray-600">
              Our AI reviews transactions to highlight tax deductions, subscription creep, and spending patterns.
              Get personalized suggestions to lower costs and improve cash flow.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>• Detect duplicate or unused subscriptions</li>
              <li>• Flag potential tax-deductible expenses</li>
              <li>• Category-level optimization tips</li>
              <li>• Actionable summaries you can apply instantly</li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              <span className="font-medium">Free:</span> limited insights ·{" "}
              <span className="font-medium">Starter:</span> simple tips ·{" "}
              <span className="font-medium">Pro:</span> full AI engine
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Weekly Insights & Reports</h2>
            <p className="mt-2 text-gray-600">
              Every week, receive a concise report: new deposits, allocations, upcoming bills, and recommended
              actions. Pro adds advanced dashboards and analytics.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>• Snapshot of income and allocations</li>
              <li>• Burn-rate and runway estimates</li>
              <li>• Category trends and anomalies</li>
              <li>• One-click links to take action</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Plan limits / External accounts */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">External Account Splits</h2>
        <p className="mt-2 text-gray-600">
          Send portions of revenue to outside bank accounts (contractors, savings, taxes). Limits vary by plan:
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-[600px] w-full border-separate border-spacing-0">
            <thead className="bg-gray-50 text-left text-sm text-gray-600">
              <tr>
                <th className="border-b px-4 py-3 font-medium">Plan</th>
                <th className="border-b px-4 py-3 font-medium">External accounts</th>
                <th className="border-b px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[{
                plan: "Free",
                limit: "0",
                notes: "Great for testing & solo use"
              },
              {
                plan: "Starter",
                limit: "1",
                notes: "One payout destination"
              },
              {
                plan: "Pro",
                limit: "5",
                notes: "Scale with multiple recipients"
              },
              {
                plan: "Enterprise",
                limit: "Unlimited",
                notes: "Team-wide rules & SLAs"
              },
              ].map((r, i) => (
                <tr key={i} className={i % 2 ? "bg-gray-50/30" : ""}>
                  <td className="border-b px-4 py-3">{r.plan}</td>
                  <td className="border-b px-4 py-3">{r.limit}</td>
                  <td className="border-b px-4 py-3 text-gray-700">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Enforcement is handled in the UI and backend (Firestore validation + audit logs).
        </p>
      </section>

      {/* Add-ons */}
      <section className="mt-12 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Add-ons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[{
            title: "AI Optimization",
            body:
              "Unlock full AI insights: tax coaching, spending analysis, and personalized savings advice.",
          },
          {
            title: "Priority Support",
            body:
              "Jump the line with faster responses and dedicated assistance. Annual discount available.",
          },
          {
            title: "Extra Team Seats",
            body:
              "Add collaborators beyond your plan’s included seats. Manage quantities from billing portal.",
          },
          ].map((a) => (
            <div key={a.title} className="rounded-xl border p-5">
              <div className="font-medium">{a.title}</div>
              <p className="mt-2 text-sm text-gray-600">{a.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Add-on pricing aligns with the billing cycle (monthly or annually). See{" "}
          <Link href="/pricing" className="underline">
            Pricing
          </Link>{" "}
          for details.
        </div>
      </section>

      {/* Security */}
      <section className="mt-12 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Security & Trust</h2>
        <div className="mt-2 grid gap-6 md:grid-cols-3">
          {[{
            title: "Bank-grade via Plaid",
            body:
              "Secure OAuth where available. Read-only access for analysis; allocations follow your rules.",
          },
          {
            title: "Privacy by design",
            body:
              "We minimize data access and store only what’s needed for automation and reporting.",
          },
          {
            title: "Audit logging",
            body:
              "Every critical action—invites, plan changes, allocations—is recorded for transparency.",
          },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border p-5">
              <div className="font-medium">{c.title}</div>
              <p className="mt-2 text-sm text-gray-600">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 rounded-2xl border bg-white p-6 shadow-sm text-center">
        <h2 className="text-xl font-semibold">Ready to automate your finances?</h2>
        <p className="mt-2 text-gray-600">
          Start free, then upgrade as you grow. Connect your bank and set your first rule in minutes.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-900"
          >
            Get started
          </Link>
          <Link href="/pricing" className="rounded-xl border px-5 py-3 text-sm font-medium hover:bg-gray-50">
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}