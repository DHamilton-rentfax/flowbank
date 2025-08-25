"use server";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// -------- Minimal Firebase Admin helper (inline) ----------
function adminApp() {
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";
    const credentials = JSON.parse(json);
    initializeApp({ credential: cert(credentials) });
  }
  return getApps()[0];
}
function serverAuth() {
  return getAuth(adminApp());
}
function db() {
  return getFirestore(adminApp());
}
// ---------------------------------------------------------

type CreateCheckoutInput = {
  uid?: string;
  customerEmail?: string;
  priceLookupKey?: string;
  lineItems?: Array<{ price: string; quantity?: number }>;
  mode?: "subscription" | "payment";
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
};

async function getStripe() {
  const Stripe = (await import("stripe")).default;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

async function getOrCreateCustomer(stripe: any, input: CreateCheckoutInput): Promise<string | undefined> {
  const { uid, customerEmail } = input;
  if (!uid && !customerEmail) return undefined;

  if (uid) {
    const ref = db().collection("stripe_customers").doc(uid);
    const doc = await ref.get();
    if (doc.exists && doc.data()?.customerId) {
      return doc.data()?.customerId as string;
    }

    const email = customerEmail || (await serverAuth().getUser(uid)).email || undefined;
    const customer = await stripe.customers.create({ email });
    await ref.set(
      {
        customerId: customer.id,
        email: email || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return customer.id;
  }

  if (customerEmail) {
    const search = await stripe.customers.search({
      query: `email:"${customerEmail}"`,
      limit: 1,
    });
    if (search.data.length) return search.data[0].id;
    const customer = await stripe.customers.create({ email: customerEmail });
    return customer.id;
  }

  return undefined;
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  const stripe = await getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const successUrl = input.successUrl || `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = input.cancelUrl || `${siteUrl}/billing/cancel`;

  const customerId = await getOrCreateCustomer(stripe, input);

  let lineItems: Array<{ price: string; quantity?: number }>;
  if (input.lineItems?.length) {
    lineItems = input.lineItems;
  } else if (input.priceLookupKey) {
    const prices = await stripe.prices.list({
      lookup_keys: [input.priceLookupKey],
      expand: ["data.product"],
      active: true,
      limit: 1,
    });
    if (!prices.data.length) {
      throw new Error(`No active Stripe Price found for lookup key: ${input.priceLookupKey}`);
    }
    lineItems = [{ price: prices.data[0].id, quantity: 1 }];
  } else {
    throw new Error("Provide either priceLookupKey or lineItems.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: input.mode || "subscription",
    customer: customerId,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: input.metadata,
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
  });

  if (input.uid) {
    await db().collection("audit_logs").add({
      type: "CHECKOUT_SESSION_CREATED",
      uid: input.uid,
      sessionId: session.id,
      createdAt: new Date(),
    });
  }

  return { url: session.url, id: session.id };
}