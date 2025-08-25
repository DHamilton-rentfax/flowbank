"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { stripe } from "@/lib/stripe"; // keep this if it already exists

// --- Minimal Firebase Admin helpers (INLINE, no src/lib imports) ---
import { cert, getApps, getApp, initializeApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let _app: App | null = null;
function adminApp(): App {
  if (_app) return _app;
  const b64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (!b64) throw new Error("FIREBASE_ADMIN_CERT_B64 is missing");
  const json = Buffer.from(b64, "base64").toString("utf8");
  const credentials = JSON.parse(json);
  _app = getApps().length ? getApp() : initializeApp({ credential: cert(credentials) });
  return _app;
}

async function serverAuth(): Promise<{ uid: string; email?: string } | null> {
  const c = await cookies();
  const session =
    c.get("__session")?.value || c.get("session")?.value || c.get("sessionToken")?.value;
  const h = await headers();
  const bearer = h.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = session || bearer;
  if (!token) return null;

  const auth = getAuth(adminApp());
  try {
    try {
      const dec = await auth.verifySessionCookie(token, true);
      return { uid: dec.uid, email: dec.email };
    } catch {
      const dec = await auth.verifyIdToken(token, true);
      return { uid: dec.uid, email: dec.email };
    }
  } catch {
    return null;
  }
}

  // Get Firebase user via Admin SDK
  const fbUser = await getUserById(sessionUser.uid);
  const email = fbUser.email || sessionUser.email || undefined;

  // --- Firestore (Admin SDK style: NO doc/getDoc imports) ---
  const db = await getDb();
  const ref = db.collection("customers").doc(sessionUser.uid);
  const snap = await ref.get();

  let customerId: string | undefined = snapshot.exists
    ? (snapshot.data()?.stripeCustomerId as string | undefined)
    : undefined;

  // Look up or create Stripe customer (by email)
  if (!customerId && email) {
    const existing = await stripe.customers.list({ email, limit: 1 });
    customerId = existing.data[0]?.id;
  }

  if (!customerId) {
    const created = await stripe.customers.create({
      email,
      name: fbUser.displayName || undefined,
      metadata: { uid: sessionUser.uid },
    });
    customerId = created.id;

    // Persist to Firestore
    await ref.set(
      {
 stripeCustomerId: customerId,
        email,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(//$/, "") || "http://localhost:3000";

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId!,
    return_url: `${base}/dashboard`,
  });

  return { url: portal.url };
}