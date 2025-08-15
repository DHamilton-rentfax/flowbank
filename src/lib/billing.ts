
import { stripe } from './stripe';
import { getAdminDb } from '@/firebase/server';

export async function getOrCreateCustomer({ uid, email }: { uid: string, email: string | null | undefined }) {
  const db = getAdminDb();
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  const data = snap.exists ? snap.data() : {};

  if (data?.stripeCustomerId) {
    return data.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: { firebaseUid: uid },
  });

  await ref.set(
    {
      stripeCustomerId: customer.id,
    },
    { merge: true }
  );

  return customer.id;
}
