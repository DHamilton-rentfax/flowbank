import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

import type { App } from "firebase-admin/app";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, type Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// ---------------- minimal Firebase Admin helper ----------------
let _app: App | null = null;

function adminApp(): App {
  if (_app) return _app;

  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (!b64) {
    throw new Error(
      "FIREBASE_ADMIN_CERT_B64 is missing. Set it in Firebase/App Hosting env or .env.local"
    );
  }

  const json = Buffer.from(b64, "base64").toString("utf-8");
  const credentials = JSON.parse(json);

  _app = getApps()[0] ?? initializeApp({ credential: cert(credentials) });
  return _app;
}

function db(): Firestore { return getFirestore(adminApp()); }
function serverAuth() { return getAuth(adminApp()); }
// ---------------- end minimal helper ---------------------------

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})
// Helper to get or create a Stripe customer ID for a Firebase user
async function getOrCreateStripeCustomerId(userId: string, email: string | undefined) {
    const firestore = db();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
        return userDoc.data()?.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
        email: email,
        metadata: {
            firebaseUID: userId,
        },
    });

    await userRef.set({ stripeCustomerId: customer.id }, { merge: true });
    return customer.id;
}


export async function POST(req: NextRequest) {
  try {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1]
    
    if (!idToken) {
        return new NextResponse("User not authenticated.", { status: 401 });
    }

    const decodedToken = await serverAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    const { lookupKey } = await req.json();

    if (!lookupKey) {
        return new NextResponse("Lookup key is required.", { status: 400 });
    }
    
    const customerId = await getOrCreateStripeCustomerId(userId, userEmail);

    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
      active: true,
    })

    if (prices.data.length === 0) {
        return new NextResponse(`Price not found for lookup key: ${lookupKey}`, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      customer: customerId,
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error:', err.message)
    return new NextResponse(`Internal Server Error: ${err.message}`, { status: 500 })
  }
}
