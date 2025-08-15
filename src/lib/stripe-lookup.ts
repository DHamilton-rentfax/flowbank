
import { stripe } from './stripe';

export async function getActivePriceIdByLookupKey(lookupKey: string) {
  const res = await stripe.prices.search({
    query: `lookup_key:'${lookupKey}' AND active:'true'`
  });
  const price = res.data?.[0];
  if (!price) throw new Error(`Active price not found for lookup_key=${lookupKey}`);
  return price.id;
}
