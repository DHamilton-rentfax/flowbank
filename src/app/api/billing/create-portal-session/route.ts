import { NextRequest } from "next/server";

export async function POST(_req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const portalReturnUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") + "/dashboard";

  if (!secret) {
    // Stripe not configured — return graceful 501 so UI can show a link to /pricing
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 501 });
  }

  // If you wire Stripe later, replace the below with real SDK calls:
  // const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
  // const session = await stripe.billingPortal.sessions.create({ customer, return_url: portalReturnUrl });

  return new Response(
    JSON.stringify({
      // Placeholder; replace with session.url from Stripe
      url: "/pricing",
      note: "Replace with Stripe Billing Portal URL once configured.",
    }),
    { status: 200 }
  );
}