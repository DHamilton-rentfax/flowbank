'use client'

import React, { useState } from 'react'
import { BillingToggle } from '@/components/pricing/BillingToggle'
import { PricingCard } from '@/components/pricing/pricing-card'
import AddonToggle from '@/components/pricing/addon-toggle'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'


export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')

  const isAnnual = billingCycle === 'year'

  // This would ideally come from the get-pricing action, but we are using the user's provided structure.
   const addons = [
        {
            id: 'ai_optimization',
            name: 'AI Optimization',
            lookup_key: isAnnual ? 'addon_ai_optimization_year_usd' : 'addon_ai_optimization_month_usd',
            description: "Unlock personalized tax coaching, spending insights, subscription analysis, and savings opportunities—powered by your real transactions.",
            amount: isAnnual ? 140 : 14,
        },
        {
            id: 'priority_support',
            name: 'Priority Support',
            lookup_key: isAnnual ? 'addon_support_year_usd' : 'addon_support_month_usd',
            description: 'Get 24/7 response times and a dedicated Slack channel for your team.',
            amount: isAnnual ? 190 : 19,
        },
    ]


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

        <BillingToggle value={billingCycle} onChange={setBillingCycle} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 max-w-7xl mx-auto">
            <PricingCard
                name="Free"
                price="$0"
                description="Start for free and connect your first bank account."
                lookupKey="price_free_monthly"
                disabled
            />
            <PricingCard
                name="Starter"
                price={isAnnual ? '$90/year' : '$9/mo'}
                description="Basic AI and simple insights."
                lookupKey={isAnnual ? 'starter_year_usd' : 'starter_month_usd'}
            />
            <PricingCard
                name="Pro"
                price={isAnnual ? '$290/year' : '$29/mo'}
                description="Full AI engine and advanced insights."
                lookupKey={isAnnual ? 'pro_year_usd' : 'pro_month_usd'}
            />
            <PricingCard
                name="Enterprise"
                price="Custom"
                description="Custom rules, team seats, integrations."
                lookupKey=""
                isEnterprise
            />
        </div>

         <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-2">
            Powerful Add-ons
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Customize your Starter or Pro plan with powerful extras.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {addons.map((addon) => (
              <AddonToggle key={addon.id} addon={addon} interval={billingCycle} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
