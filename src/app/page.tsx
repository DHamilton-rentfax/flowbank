import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, Zap, Banknote, BarChart3, Wallet, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative">
      {/* subtle gradient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[35rem] w-[80rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-200 via-sky-200 to-green-100 blur-3xl opacity-60" />
      </div>

      {/* HERO */}
      <section className="px-6 sm:px-8">
        <div className="mx-auto max-w-7xl pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-black/5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Bank-grade security with Plaid
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
              Automate Your Business Finances
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-gray-600">
              FlowBank splits incoming revenue into taxes, savings, and operating expenses
              automatically—so you can focus on running the business, not the spreadsheets.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center rounded-xl bg-primary px-5 py-3 text-primary-foreground transition hover:opacity-90"
              >
                Get started free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-xl border bg-background px-5 py-3 text-gray-900 hover:bg-muted"
              >
                View pricing
              </Link>
            </div>

            {/* Trust logos */}
            <div className="mt-12 text-center">
              <p className="text-xs uppercase tracking-wider text-gray-500">Trusted by solo founders & finance teams</p>
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 opacity-70 sm:grid-cols-4">
                {["Nimbus", "Aurora", "Northstar", "Parallel"].map((n) => (
                  <div key={n} className="text-sm font-semibold text-gray-500">{n}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-y bg-background/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-3 sm:px-8">
          <Benefit
            icon={<Banknote className="h-5 w-5" />}
            title="Connect your bank"
            desc="Securely link accounts with Plaid. We detect income automatically."
          />
          <Benefit
            icon={<Zap className="h-5 w-5" />}
            title="Set your rules"
            desc="Choose percentages for Taxes, Profit, and Operating Costs."
          />
          <Benefit
            icon={<BarChart3 className="h-5 w-5" />}
            title="Money allocates itself"
            desc="Every deposit is auto-routed into the right buckets in real time."
          />
        </div>
      </section>

      {/* PRODUCT HIGHLIGHTS */}
      <section className="px-6 sm:px-8">
        <div className="mx-auto max-w-7xl py-20 sm:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl text-primary">Rules that match the way you run money</h2>
              <p className="mt-4 text-gray-600">
                Create categories for Taxes, Profit, and Operating Costs. Set targets once—FlowBank keeps you on track with
                automatic allocations and guardrails.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Auto-allocate every incoming payment instantly",
                  "Safety rails to prevent overspending",
                  "Real-time balances for each virtual account",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent" />
                    <span className="text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/dashboard" className="inline-flex items-center rounded-xl border bg-background px-4 py-2 hover:bg-muted">
                  See it in action
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border bg-background p-4 shadow-lg ring-1 ring-black/5">
                <div className="rounded-xl bg-muted p-6">
                  <Image
                    src="https://picsum.photos/600/400"
                    alt="FlowBank Dashboard Screenshot"
                    width={600}
                    height={400}
                    className="rounded-lg"
                    data-ai-hint="dashboard finances"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 hidden rounded-xl border bg-background px-4 py-3 text-sm shadow-md ring-1 ring-black/5 md:block">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="font-medium">Profit bucket topped up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="bg-muted">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            <Metric kpi="$120k+" label="Funds auto-allocated" />
            <Metric kpi="12h/mo" label="Time saved on cash ops" />
            <Metric kpi="99.99%" label="Allocation accuracy" />
            <Metric kpi="2 min" label="Average setup time" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 sm:px-8">
        <div className="mx-auto max-w-7xl py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl text-primary">Teams keep cash under control</h2>
            <p className="mt-3 text-gray-600">
              From solo founders to finance teams, FlowBank gives instant clarity on where money goes.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Testimonial
              quote="We stopped guessing. Taxes and profit are always funded, and ops can’t overspend."
              author="Maya — COO, Parallel"
            />
            <Testimonial
              quote="Set it once and forget it. It’s the envelope system for modern businesses."
              author="Ethan — Founder, Northstar"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
          <h2 className="text-2xl font-bold sm:text-3xl text-primary">Frequently asked</h2>
          <dl className="mt-8 grid gap-6 md:grid-cols-2">
            <QA q="How does FlowBank connect to my bank?" a="We use Plaid to securely connect your accounts. You can remove access at any time." />
            <QA q="Can I change my percentages later?" a="Yes. Update rules anytime; new deposits follow the latest settings." />
            <QA q="Do you move real money?" a="We create virtual buckets and help you mirror them in your bank. Full automation is available with supported partners." />
            <QA q="Is there a free plan?" a="Yes. Get started free and upgrade when you need advanced automations and team access." />
          </dl>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 sm:px-8">
        <div className="mx-auto max-w-7xl py-16 sm:py-20 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl text-primary">Start in minutes</h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Connect your bank, set your percentages, and let FlowBank handle the rest.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-primary-foreground transition hover:opacity-90"
            >
              Create your account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* --- small presentational pieces --- */

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          {icon}
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function Metric({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div className="rounded-2xl border bg-background px-6 py-8 shadow-sm">
      <div className="text-3xl font-bold text-primary">{kpi}</div>
      <div className="mt-2 text-sm text-gray-600">{label}</div>
    </div>
  );
}

function Testimonial({ quote, author }: { quote: string; author: string }) {
  return (
    <figure className="rounded-2xl border bg-background p-6 shadow-sm">
      <blockquote className="text-gray-800">“{quote}”</blockquote>
      <figcaption className="mt-4 text-sm text-gray-600">— {author}</figcaption>
    </figure>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <dt className="font-semibold">{q}</dt>
      <dd className="mt-2 text-sm text-gray-600">{a}</dd>
    </div>
  );
}
