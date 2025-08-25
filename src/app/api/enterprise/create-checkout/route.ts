
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getOrCreateCustomer } from '@/lib/billing';
import { getActivePriceIdByLookupKey } from '@/lib/stripe-lookup';
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Firestore, WriteBatch } from "firebase-admin/firestore";

// ---------------- minimal Firebase Admin helper ----------------
function adminApp() {
  if (getApps().length === 0) {
    const credentialsJson = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";

    const credentials = JSON.parse(credentialsJson);
    initializeApp({ credential: cert(credentials) });
  }
  return getApps()[0];
}

function serverAuth() {
  return getAuth(adminApp());
}

function db(): Firestore {
  return getFirestore(adminApp());
}
// ---------------- end minimal helper ---------------------------

function getBearer(req: NextRequest) {
  const h = req.headers.get('authorization') || '';
  const [scheme, token] = h.split(' ');
  return /^Bearer$/i.test(scheme) ? token : null;
}

export async function POST(req: NextRequest) {
  try {
    const token = getBearer(req);
    if (!token) return NextResponse.json({ error: 'User not authenticated (no token)' }, { status: 401 });

    let decoded;
    try {
 decoded = await serverAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'User not authenticated (invalid token)' }, { status: 401 });
    }

    const { uid, email } = decoded;
    const { seats = 10, interval = 'month' } = await req.json();
    const totalSeats = Math.max(10, Number(seats) || 10);
    const extraSeatQty = Math.max(0, totalSeats - 10);

    const customerId = await getOrCreateCustomer({ uid, email });

    const baseLookup = interval === 'year'
      ? (process.env.ENTERPRISE_BASE_YEAR_LOOKUP || 'pro_year_usd') // Fallback to pro yearly
      : (process.env.ENTERPRISE_BASE_LOOKUP || 'enterprise_month_usd');

    const seatLookup = process.env.ENTERPRISE_SEAT_LOOKUP || 'addon_seat_month_usd';

    const basePriceId = await getActivePriceIdByLookupKey(baseLookup);
    const seatPriceId = await getActivePriceIdByLookupKey(seatLookup);

    const line_items = [{ price: basePriceId, quantity: 1 }];
    if (extraSeatQty > 0) {
      line_items.push({ price: seatPriceId, quantity: extraSeatQty });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items,
      automatic_tax: { enabled: true },
      allow_promotion_codes: false,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        firebaseUid: uid,
        plan: 'enterprise',
        includedSeats: '10',
        requestedSeats: String(totalSeats),
        extraSeatQty: String(extraSeatQty),
        billingInterval: interval
      },
      subscription_data: {
        metadata: { firebaseUid: uid, plan: 'enterprise', includedSeats: '10' }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('enterprise create-checkout error', err);
    const error = err as Error;
    return NextResponse.json({ error: `Internal error creating Enterprise checkout: ${error.message}` }, { status: 500 });
  }
}
    
