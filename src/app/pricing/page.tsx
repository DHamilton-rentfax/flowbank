
export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0/mo",
      badge: "",
      features: ["1 bank connection", "Manual rules", "Basic insights"],
      cta: "Get Started",
      subcopy: "",
    },
    {
      name: "Starter",
      price: "$9.99/mo",
      badge: "Best for solo founders",
      features: ["Automated splits (basic)", "1 bank", "Weekly insights", "Email support"],
      cta: "Choose Starter",
      subcopy: "With selected add-ons: $9.99/mo",
    },
    {
      name: "Pro",
      price: "$29/mo",
      badge: "Most popular",
      features: [
        "Automations (advanced)",
        "Up to 5 banks & external splits",
        "Full AI Financial Advisor",
        "Advanced reporting & analytics",
        "Priority support",
      ],
      cta: "Choose Pro",
      subcopy: "With selected add-ons: $29/mo",
    },
    {
      name: "Enterprise",
      price: "Custom",
      badge: "",
      features: ["Custom rules & integrations", "Unlimited external accounts", "SSO / SLA & dedicated support"],
      cta: "Contact Sales",
      subcopy: "",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Flexible Plans for Any Business</h1>
        <p className="mt-3 text-muted-foreground">
          Start for free, then choose a plan that grows with you. Switch or cancel anytime.
        </p>

        {/* Toggle row (static for now) */}
        <div className="mt-6 inline-flex rounded-full border bg-background p-1">
          <button
            className="rounded-full px-4 py-2 text-sm font-medium shadow-sm"
            style={{ background: "var(--background)" }}
          >
            Monthly
          </button>
          <button className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground">
            Annually <span className="ml-1 opacity-70">(Save ~16%)</span>
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {plans.map((p) => (
          <article
            key={p.name}
            className="flex flex-col rounded-2xl border bg-card text-card-foreground shadow-sm"
          >
            {/* Top content */}
            <div className="p-6">
              <header className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">{p.name}</h3>
                  {p.badge ? (
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {p.badge}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 text-4xl font-semibold">{p.price}</div>
              </header>

              <ul className="space-y-2 text-sm leading-6">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/70"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA area pinned to bottom */}
            <div className="mt-auto p-6 pt-0">
              <button
                className={[
                  "w-full h-11 rounded-full text-sm font-medium",
                  p.name === "Free" || p.name === "Starter" || p.name === "Pro"
                    ? "bg-foreground text-background hover:opacity-90"
                    : "border bg-background text-foreground hover:bg-muted",
                ].join(" ")}
              >
                {p.cta}
              </button>
              {p.subcopy ? (
                <p className="mt-2 text-center text-xs text-muted-foreground">{p.subcopy}</p>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
