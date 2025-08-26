import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How FlowBank Works",
  description:
    "Connect your bank, set smart rules, and let FlowBank automate your allocations with AI insights and weekly reports.",
};

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-14">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-primary">How FlowBank Works</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Connect your bank, set your income split rules, and let FlowBank automate allocations—while our AI
          surfaces savings, tax opportunities, and weekly insights.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/signup">Get started free</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">View pricing</Link>
          </Button>
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
          <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="text-3xl">{s.emoji}</div>
            <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </section>

      {/* AI + Insights */}
      <section className="mt-12 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">AI Financial Advisor</h2>
            <p className="mt-2 text-muted-foreground">
              Our AI reviews transactions to highlight tax deductions, subscription creep, and spending patterns.
              Get personalized suggestions to lower costs and improve cash flow.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-card-foreground">
              <li>• Detect duplicate or unused subscriptions</li>
              <li>• Flag potential tax-deductible expenses</li>
              <li>• Category-level optimization tips</li>
              <li>• Actionable summaries you can apply instantly</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-medium">Free:</span> limited insights ·{" "}
              <span className="font-medium">Starter:</span> simple tips ·{" "}
              <span className="font-medium">Pro:</span> full AI engine
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Weekly Insights & Reports</h2>
            <p className="mt-2 text-muted-foreground">
              Every week, receive a concise report: new deposits, allocations, upcoming bills, and recommended
              actions. Pro adds advanced dashboards and analytics.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-card-foreground">
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
        <p className="mt-2 text-muted-foreground">
          Send portions of revenue to outside bank accounts (contractors, savings, taxes). Limits vary by plan:
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border">
          <table className="min-w-[600px] w-full border-separate border-spacing-0">
            <thead className="bg-muted text-left text-sm text-muted-foreground">
              <tr>
                <th className="border-b px-4 py-3 font-medium">Plan</th>
                <th className="border-b px-4 py-3 font-medium">External accounts</th>
                <th className="border-b px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="text-sm bg-card">
              {[
                { plan: "Free", limit: "0", notes: "Great for testing & solo use" },
                { plan: "Starter", limit: "1", notes: "One payout destination" },
                { plan: "Pro", limit: "5", notes: "Scale with multiple recipients" },
                { plan: "Enterprise", limit: "Unlimited", notes: "Team-wide rules & SLAs" },
              ].map((r, i) => (
                <tr key={i} className={i % 2 ? "bg-muted/30" : ""}>
                  <td className="border-b px-4 py-3">{r.plan}</td>
                  <td className="border-b px-4 py-3">{r.limit}</td>
                  <td className="border-b px-4 py-3 text-muted-foreground">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Enforcement is handled in the UI and backend (Firestore validation + audit logs).
        </p>
      </section>

      {/* Add-ons */}
      <section className="mt-12 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Add-ons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { title: "AI Optimization", body: "Unlock full AI insights: tax coaching, spending analysis, and personalized savings advice." },
            { title: "Priority Support", body: "Jump the line with faster responses and dedicated assistance. Annual discount available." },
            { title: "Extra Team Seats", body: "Add collaborators beyond your plan’s included seats. Manage quantities from billing portal." },
          ].map((a) => (
            <div key={a.title} className="rounded-xl border p-5">
              <div className="font-medium">{a.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Add-on pricing aligns with the billing cycle (monthly or annually). See{" "}
          <Link href="/pricing" className="underline hover:text-primary">
            Pricing
          </Link>{" "}
          for details.
        </div>
      </section>

      {/* Security */}
      <section className="mt-12 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Security & Trust</h2>
        <div className="mt-2 grid gap-6 md:grid-cols-3">
          {[
            { title: "Bank-grade via Plaid", body: "Secure OAuth where available. Read-only access for analysis; allocations follow your rules." },
            { title: "Privacy by design", body: "We minimize data access and store only what’s needed for automation and reporting." },
            { title: "Audit logging", body: "Every critical action—invites, plan changes, allocations—is recorded for transparency." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border p-5">
              <div className="font-medium">{c.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 rounded-2xl border bg-card p-6 shadow-sm text-center">
        <h2 className="text-xl font-semibold">Ready to automate your finances?</h2>
        <p className="mt-2 text-muted-foreground">
          Start free, then upgrade as you grow. Connect your bank and set your first rule in minutes.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
