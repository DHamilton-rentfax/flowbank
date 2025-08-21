'use client'
import SafeImage from '@/components/ui/SafeImage'
import { useState } from 'react'
import { Toggle } from '@/components/ui/toggle'
import { PricingCard } from '@/components/pricing-card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    lookupKeys: { monthly: 'starter_month_usd', annual: 'starter_year_usd' }, // Using starter for test purposes, as free plans shouldn't have checkout.
    features: ['Bank connection', 'Split income'],
    disabled: true,
    ctaLabel: 'Get Started'
  },
  {
    name: 'Starter',
    price: { monthly: 9, annual: 90 },
    lookupKeys: { monthly: 'starter_month_usd', annual: 'starter_year_usd' },
    features: ['Free features', 'Weekly insights', 'Basic AI Suggestions'],
    ctaLabel: 'Choose Plan'
  },
  {
    name: 'Pro',
    price: { monthly: 29, annual: 290 },
    lookupKeys: { monthly: 'pro_month_usd', annual: 'pro_year_usd' },
    features: ['Starter features', 'Full AI Engine', 'Priority Support', 'Dashboard Analytics'],
    ctaLabel: 'Choose Plan'
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    lookupKeys: { monthly: null, annual: null },
    features: ['Custom rules', 'Team seats', 'Integrations', 'SLA'],
    contact: true,
    ctaLabel: 'Contact Sales'
  },
]

const ADDONS = [
  {
    name: 'AI Optimization',
    description: "Unlock personalized tax coaching, spending insights, subscription analysis, and savings opportunities—powered by your real transactions.",
    price: { monthly: 14, annual: 140 },
    lookupKeys: { monthly: 'addon_ai_optimization_month_usd', annual: 'addon_ai_optimization_year_usd' },
  },
  {
    name: 'Priority Support',
    description: "Get 24/7 response times and a dedicated Slack channel for your team.",
    price: { monthly: 19, annual: 190 }, // Rounded from 191.52 for simplicity
    lookupKeys: { monthly: 'addon_support_month_usd', annual: 'addon_support_year_usd' },
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const isAnnual = billingCycle === 'annual';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary py-16 px-4">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-center mb-2">
                Flexible Plans for Any Business
            </h1>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start for free, then choose a plan that grows with you. All paid plans come with a 7-day free trial. Switch or cancel anytime.
            </p>
        </div>
        
        <div className="flex justify-center mb-8">
            <Toggle
            pressed={isAnnual}
            onPressedChange={() => setBillingCycle(isAnnual ? 'monthly' : 'annual')}
            className="rounded-full px-6 py-2 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
            {isAnnual ? 'Annual Billing (Save ~16%)' : 'Monthly Billing'}
            </Toggle>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {PLANS.map((plan) => (
            <PricingCard
                key={plan.name}
                plan={plan}
                billingCycle={billingCycle}
            />
            ))}
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-2">
            Powerful Add-ons
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Customize your Starter or Pro plan with powerful extras.
          </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {ADDONS.map((addon) => (
                    <div key={addon.name} className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm flex flex-col">
                        <h3 className="font-semibold text-lg">{addon.name}</h3>
                        <p className="text-muted-foreground text-sm flex-1">{addon.description}</p>
                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <span className="text-2xl font-bold">
                                    ${isAnnual ? addon.price.annual : addon.price.monthly}
                                </span>
                                <span className="text-muted-foreground text-sm">/{isAnnual ? 'year' : 'month'}</span>
                            </div>
                            <Button asChild>
                                <Link href={`/checkout/${isAnnual ? addon.lookupKeys.annual : addon.lookupKeys.monthly}`}>Add to Plan</Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
