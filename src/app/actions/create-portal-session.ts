"use server";

import { cookies, headers } from "next/headers";
// If you already have a shared Stripe client at "@/lib/stripe", keep this import.
// Otherwise, comment it out and use the inline getStripe() below.
import { stripe as sharedStripe } from "@/lib/stripe";

import Stripe from "stripe";
import { cert, getApps, getApp, initializeApp, type App } from "firebase-admin/app";
import { getAuth as getAdminAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/* ----------------------------- Stripe helper ----------------------------- */

function getStripe(): Stripe {
  // Prefer shared instance if your project provides it
  if (sharedStripe) return sharedStripe as unknown as Stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key, { apiVersion: "2024-06-20" }); // pin your version
}

/* ------------------------ Firebase Admin initializers ------------------------ */

let _adminApp: App | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;

  // Option A: single base64 JSON for service account
  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const credentials = JSON.parse(json);
    _adminApp = getApps().length ? getApp() : initializeApp({ credential: cert(credentials) });
    return _adminApp;
  }

  // Option B: discrete env vars (good for many hosts)
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Provide FIREBASE_ADMIN_CERT_B64 or the discrete vars."
    );
  }

  _adminApp = getApps().length
    ? getApp()
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

  return _adminApp;
}

function db(): Firestore {
  return getFirestore(getAdminApp());
}

function adminAuth() {
  return getAdminAuth(getAdminApp());
}

/* ----------------------------- Auth extraction ----------------------------- */

type SessionUser = { uid: string; email?: string };

async function getSessionUser(): Promise<SessionUser | null> {
  // In app router server actions, cookies()/headers() are sync getters.
  const c = cookies();
  const h = headers();

  const possible =
    c.get("__session")?.value ||
    c.get("session")?.value ||
    c.get("sessionToken")?.value ||
    h.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!possible) return null;

  const auth = adminAuth();

  // Try session cookie first, then ID token
  try {
    const dec = await auth.verifySessionCookie(possible, true);
    return { uid: dec.uid, email: dec.email ?? undefined };
  } catch {
    // fall through
  }

  try {
    const dec: DecodedIdToken = await auth.verifyIdToken(possible, true);
    return { uid: dec.uid, email: dec.email ?? undefined };
  } catch {
    return null;
  }
}

/* ------------------------- Firestore customer document ------------------------- */

async function getOrCreateStripeCustomerForUser(
  user: SessionUser
): Promise<{ customerId: string; email?: string }> {
  const auth = adminAuth();
  const userRecord = await auth.getUser(user.uid); // throws if not found

  const email = userRecord.email || user.email || undefined;
  const firestore = db();
  const ref = firestore.collection("customers").doc(user.uid);
  const snap = await ref.get();

  let customerId: string | undefined = snap.exists
    ? (snap.data()?.stripeCustomerId as string | undefined)
    : undefined;

  const stripe = getStripe();

  // If not stored, try to find an existing Stripe customer by email.
  if (!customerId && email) {
    const existing = await stripe.customers.list({ email, limit: 1 });
    customerId = existing.data[0]?.id;
  }

  // If still not found, create a new customer.
  if (!customerId) {
    const created = await stripe.customers.create({
      email,
      name: userRecord.displayName || undefined,
      metadata: { uid: user.uid },
    });
    customerId = created.id;

    await ref.set(
      {
        stripeCustomerId: customerId,
        email: email ?? null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  return { customerId, email };
}

function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000";
  return raw.replace(/\/$/, ""); // trim trailing slash
}

/* ------------------------------- Server action ------------------------------- */

export async function createPortalSession(): Promise<{ url: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    // Prefer throwing so the caller can show a login prompt
    throw new Error("Not authenticated");
  }

  const { customerId } = await getOrCreateStripeCustomerForUser(sessionUser);

  const stripe = getStripe();
  const base = getBaseUrl();

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}/dashboard`,
  });

  if (!portal.url) {
    throw new Error("Failed to create Stripe Billing Portal session");
  }

  return { url: portal.url };
}
