
"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const formatPrice = (monthly: number, annually: number) =>
    annual ? `$${annually}/yr` : `$${monthly}/mo`;

  const plans = [
    {
      name: "Free",
      monthly: 0,
      annually: 0,
      features: [true, true, false, false, false, false, false, false, false, false],
      button: { label: "Get Started", link: "/signup" },
    },
    {
      name: "Starter",
      monthly: 9,
      annually: 90,
      features: [true, true, "Basic", "Simple tips", "Add-on", true, "Add-on", false, false, true],
      button: { label: "Get Started", link: "/signup" },
    },
    {
      name: "Pro",
      monthly: 29,
      annually: 290,
      features: [true, true, "Advanced", "Full AI Engine", true, true, true, true, true, true],
      button: { label: "Get Started", link: "/signup" },
    },
    {
      name: "Enterprise",
      monthly: null,
      annually: null,
      features: [true, true, true, true, true, true, true, true, true, true],
      button: { label: "Contact Sales", link: "/contact" },
    },
  ];

  const features = [
    "Connect Bank Account",
    "Create and Customize Splits",
    "Automatic Allocations",
    "AI Suggestions",
    "Priority Support",
    "Weekly Insights",
    "Dashboard Analytics",
    "Multi-Bank Support",
    "Audit Logging",
    "Add-ons Available",
  ];

  const AddOns = [
    {
      title: "AI Optimization",
      price: "$14.00/mo",
      description:
        "Unlock full access to FlowBank's AI Financial Advisor. Personalized tax coaching, spending insights, subscription analysis, and savings recommendations.",
    },
    {
      title: "Priority Support",
      price: "$19.00/mo",
      description:
        "Fast-track access to our support team with guaranteed 24h response.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-secondary py-16 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-center mb-2">
                Flexible Plans for Any Business
            </h1>
            <p className="text-center text-muted-foreground mb-8">
                Start for free, then choose a plan that grows with you. Switch or cancel anytime.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setAnnual(false)}
              variant={!annual ? "default" : "outline"}
            >
              Monthly
            </Button>
            <Button
              onClick={() => setAnnual(true)}
              variant={annual ? "default" : "outline"}
            >
              Annually (Save ~16%)
            </Button>
          </div>

          <div className="overflow-x-auto max-w-5xl mx-auto">
            <table className="min-w-full mx-auto bg-background shadow-lg rounded-lg overflow-hidden border">
              <thead>
                <tr className="bg-muted text-sm text-left">
                  <th className="p-4 font-semibold">FEATURES</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="p-4 text-center uppercase text-xs font-semibold text-muted-foreground">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={feature} className="border-t text-sm">
                    <td className="p-4 font-medium">{feature}</td>
                    {plans.map((plan) => (
                      <td key={plan.name + idx} className="text-center p-4">
                        {plan.features[idx] === true ? (
                          <Check className="text-green-500 w-5 h-5 mx-auto" />
                        ) : plan.features[idx] === false ? (
                          <X className="text-red-500 w-5 h-5 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-xs font-medium">{plan.features[idx]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr className="border-t">
                  <td className="p-4 font-bold">Price</td>
                  {plans.map((plan) => (
                    <td key={plan.name + "price"} className="text-center p-4 font-bold text-lg">
                      {plan.monthly === null ? "Custom" : formatPrice(plan.monthly, plan.annually)}
                    </td>
                  ))}
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-4"></td>
                  {plans.map((plan) => (
                    <td key={plan.name + "cta"} className="text-center p-4">
                      <Button asChild>
                        <Link href={plan.button.link}>
                            {plan.button.label}
                        </Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-2">Add-on Marketplace</h2>
            <p className="text-center text-muted-foreground mb-8">
              Customize your Starter or Pro plan with powerful extras.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {AddOns.map((addon) => (
                <div key={addon.title} className="bg-background p-6 shadow rounded-lg border">
                  <h3 className="text-lg font-semibold mb-1">{addon.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{addon.description}</p>
                  <p className="text-xl font-bold mb-4">{addon.price}</p>
                  <Button>
                    Add to Plan
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
    </div>
  );
}
