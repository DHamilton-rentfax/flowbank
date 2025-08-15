#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const CONFIG_PATH = path.resolve(process.cwd(), 'scripts/stripe/catalog.config.json');

function log(...args) { console.log('[stripe-catalog]', ...args); }

async function findProductBySlug(slug) {
  // Use Product Search (recommended). Ensure search is enabled on your account.
  const res = await stripe.products.search({
    query: `active:'true' AND metadata['slug']:'${slug}'`
  });
  return res.data[0] || null;
}

async function upsertProduct({ slug, name, description }) {
  let product = await findProductBySlug(slug);
  if (product) {
    if (product.name !== name || product.description !== description) {
      product = await stripe.products.update(product.id, {
        name,
        description,
        metadata: { ...(product.metadata || {}), slug }
      });
      log(`Updated product ${name} (${product.id})`);
    } else {
      log(`Product exists ${name} (${product.id})`);
    }
    return product;
  }
  product = await stripe.products.create({
    name,
    description,
    metadata: { slug }
  });
  log(`Created product ${name} (${product.id})`);
  return product;
}

async function findPriceByLookupKey(lookup_key) {
  // Price Search by lookup_key (fast & idempotent)
  const res = await stripe.prices.search({ query: `lookup_key:'${lookup_key}' AND active:'true'` });
  return res.data[0] || null;
}

function priceInputFromConfig(cfg, productId, currency, tax_behavior) {
  const {
    lookup_key,
    unit_amount,
    recurring,
    billing_scheme,         // optional
    nickname,               // optional
    adjustable_quantity     // optional
  } = cfg;

  const base = {
    currency,
    unit_amount,
    product: productId,
    lookup_key,
    tax_behavior,
    nickname,
    billing_scheme
  };

  if (recurring) base.recurring = recurring;
  if (adjustable_quantity) base.transform_quantity = null; // ensure no transform conflicts
  return base;
}

async function upsertPrice(prod, currency, tax_behavior, priceCfg) {
  const existing = await findPriceByLookupKey(priceCfg.lookup_key);
  const desired = priceInputFromConfig(priceCfg, prod.id, currency, tax_behavior);

  if (existing) {
    // Prices are immutable in amount/recurrence. If anything material changed, create a new Price and (optionally) deactivate old.
    const needsNew =
      existing.unit_amount !== desired.unit_amount ||
      JSON.stringify(existing.recurring || {}) !== JSON.stringify(desired.recurring || {}) ||
      existing.currency !== desired.currency ||
      (existing.tax_behavior || 'unspecified') !== (desired.tax_behavior || 'unspecified') ||
      existing.product !== desired.product;

    if (needsNew) {
      log(`Creating new price for lookup_key=${priceCfg.lookup_key} (changes detected).`);
      const created = await stripe.prices.create(desired);
      // Optionally deactivate the previous price:
      await stripe.prices.update(existing.id, { active: false });
      return created;
    } else {
      log(`Price exists (lookup_key=${priceCfg.lookup_key}, id=${existing.id})`);
      return existing;
    }
  } else {
    const created = await stripe.prices.create(desired);
    log(`Created price (lookup_key=${priceCfg.lookup_key}, id=${created.id})`);
    return created;
  }
}

async function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config not found at ${CONFIG_PATH}`);
  }
  const json = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const { currency, tax_behavior, products } = json;

  for (const p of products) {
    const product = await upsertProduct(p);
    for (const priceCfg of p.prices) {
      const price = await upsertPrice(product, currency, tax_behavior, priceCfg);
      // Optional: add extra attributes like adjustable_quantity on Checkout via line_items (not on the price itself)
      if (priceCfg.trial_period_days) {
        // Trial is handled at subscription level or via Checkout's subscription_data; logging for awareness
        log(`Note: trials are set during Checkout (trial_period_days=${priceCfg.trial_period_days}).`);
      }
    }
  }

  log('Catalog upsert complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
