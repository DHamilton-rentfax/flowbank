"use client";

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link';

type Props = {
  name: string
  price: string
  description: string
  lookupKey: string
  disabled?: boolean
  isEnterprise?: boolean
}

export function PricingCard({
  name,
  price,
  description,
  lookupKey,
  disabled,
  isEnterprise
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const handleCheckout = async () => {
    if (!lookupKey || disabled) return
    setLoading(true);
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lookupKey }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
        console.error("Failed to create checkout session");
        setLoading(false);
    }
  }

  return (
    <div className="border rounded-lg p-6 text-center bg-white shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
        <p className="text-2xl font-bold mt-4">{price}</p>
      </div>

      <div className="mt-6">
        {isEnterprise ? (
          <Button asChild className="w-full" variant="outline">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        ) : (
          <Button onClick={handleCheckout} className="w-full" disabled={disabled || loading}>
            {loading ? "Processing..." : "Get Started"}
          </Button>
        )}
      </div>
    </div>
  )
}
