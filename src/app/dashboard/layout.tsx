import { ReactNode } from "react";
import type { Metadata } from "next";
import HeaderDashboard from "../components/HeaderDashboard";

// If you store Stripe customer id in Firestore, you can fetch it in a server action.
// For simplicity here, we'll pass null and you can thread the real id later.
export const metadata: Metadata = {
  title: "FlowBank — Dashboard",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const stripeCustomerId = null; // TODO: thread from server action or RSC when ready

  return (
    <>
      <HeaderDashboard stripeCustomerId={stripeCustomerId} />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}
