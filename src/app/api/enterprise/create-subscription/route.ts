
import { NextRequest, NextResponse } from 'next/server';
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { stripe } from '@/lib/stripe';
import { getOrCreateCustomer } from '@/lib/billing';
import { getActivePriceIdByLookupKey } from '@/lib/stripe-lookup';

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

function db() {
 return getFirestore(adminApp());
}

async function getUserById(uid: string) {
 return serverAuth().getUser(uid);
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
      decoded = await getAdminAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'User not authenticated (invalid token)' }, { status: 401 });
    }

    const { uid, email } = decoded;
    const { seats = 10, interval = 'month', trialDays = 0 } = await req.json();
    const totalSeats = Math.max(10, Number(seats) || 10);
    const extraSeatQty = Math.max(0, totalSeats - 10);

    const customerId = await getOrCreateCustomer({ uid, email });

    const baseLookup = interval === 'year'
      ? (process.env.ENTERPRISE_BASE_YEAR_LOOKUP || 'pro_year_usd')
      : (process.env.ENTERPRISE_BASE_LOOKUP || 'enterprise_month_usd');

    const seatLookup = process.env.ENTERPRISE_SEAT_LOOKUP || 'addon_seat_month_usd';

    const basePriceId = await getActivePriceIdByLookupKey(baseLookup);
    const seatPriceId = await getActivePriceIdByLookupKey(seatLookup);

    const items = [{ price: basePriceId, quantity: 1 }];
    if (extraSeatQty > 0) {
      items.push({ price: seatPriceId, quantity: extraSeatQty });
    }

    const sub = await stripe.subscriptions.create({
      customer: customerId,
      items,
      trial_period_days: trialDays || undefined,
      proration_behavior: 'create_prorations',
      metadata: { firebaseUid: uid, plan: 'enterprise', includedSeats: '10', requestedSeats: String(totalSeats) }
    });

    return NextResponse.json({ id: sub.id, status: sub.status });
  } catch (err) {
    console.error('enterprise create-subscription error', err);
    const error = err as Error;
    return NextResponse.json({ error: `Internal error creating Enterprise subscription: ${error.message}` }, { status: 500 });
  }
}
