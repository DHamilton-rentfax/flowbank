
"use server";

import { getUserById } from '@/lib/firebase-admin'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export async function createPortalSession() {
  const session = await auth();
  const uid = session?.user?.uid;

  if (!uid) {
    redirect('/login');
  }

  const user = await getUserById(uid);
  if (!user?.stripeCustomerId) {
    throw new Error('No Stripe customer ID found for this user.');
  }

  const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        });

        return { success: true, url: portal.url };

    } catch (error) {
        console.error("Error creating portal session:", error);
        return { success: false, error: errorMessage };
    }
}
