import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { admin } from '@/lib/firebase'; // Assuming you have a firebase admin instance
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user (example using Firebase Admin SDK)
    const authorization = req.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get customer ID from Firestore or wherever you store it
    const userDoc = await db.collection('users').doc(uid).get();
    const customerId = userDoc.data()?.stripeCustomerId;


    if (!customerId) {
      return NextResponse.json({ message: 'Stripe customer ID not found' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.nextUrl.origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}