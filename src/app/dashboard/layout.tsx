import { ReactNode } from "react";
import type { Metadata } from "next";
import HeaderDashboard from "../components/HeaderDashboard";
import { getSessionUser } from "@/lib/auth-server";
import { getAdminDb } from "@/firebase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "FlowBank — Dashboard",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  let customerId: string | null = null;
  try {
    const customerDoc = await getAdminDb().collection("stripe_customers").doc(user.uid).get();
    if (customerDoc.exists) {
      customerId = customerDoc.data()?.customerId || null;
    }
  } catch (error) {
    console.error("Failed to fetch Stripe customer ID:", error);
  }

  return (
    <>
      <HeaderDashboard stripeCustomerId={customerId} />
      <main className="bg-background min-h-screen">{children}</main>
    </>
  );
}
