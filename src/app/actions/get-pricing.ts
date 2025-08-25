"use server";

import Stripe from 'stripe'

// This check ensures that the file is not imported on the client side.
if (typeof window !== 'undefined') {
    throw new Error('This file should not be imported on the client side.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function getPricingProducts(billingPeriod: 'month' | 'year') {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    })

    const plans = prices.data
      .filter((price) => {
        const product = price.product as Stripe.Product;
        return (
          price.recurring?.interval === billingPeriod &&
          typeof price.unit_amount === 'number' &&
          product &&
          product.metadata.category !== 'addon'
        )
      })
      .map((price) => {
        const product = price.product as Stripe.Product
        return {
          id: price.id,
          lookup_key: price.lookup_key,
          name: product.name,
          description: product.description,
          amount: (price.unit_amount ?? 0) / 100,
          interval: price.recurring?.interval,
          metadata: product.metadata,
          features: product.metadata.features?.split(',') || [],
          highlight: product.metadata.highlight === 'true',
          customLabel: product.metadata.customLabel
        }
      })
      .sort((a, b) => a.amount - b.amount);

    return plans
  } catch (err) {
    console.error('[getPricingProducts error]', err)
    return []
  }
}

export async function getPricingAddons(billingPeriod: 'month' | 'year') {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    })

    const addons = prices.data
      .filter((price) => {
        const product = price.product as Stripe.Product;
        return (
          price.recurring?.interval === billingPeriod &&
          typeof price.unit_amount === 'number' &&
          product &&
          product.metadata.category === 'addon'
        )
      })
      .map((price) => {
        const product = price.product as Stripe.Product
        return {
          id: price.id,
          lookup_key: price.lookup_key,
          name: product.name,
          description: product.description,
          amount: (price.unit_amount ?? 0) / 100,
          interval: price.recurring?.interval,
          metadata: product.metadata,
        }
      })
     .sort((a, b) => a.amount - b.amount);

    return addons
  } catch (err) {
    console.error('[getPricingAddons error]', err)
    return []
  }
}
