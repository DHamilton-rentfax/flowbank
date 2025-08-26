"use client";

import Link from "next/link";
import { useState } from "react";
import BillingPortalButton from "./BillingPortalButton";
import { Button } from "@/components/ui/button";

export default function HeaderDashboard({
  stripeCustomerId,
}: {
  stripeCustomerId?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Overview</Link>
      <Link href="/reporting" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Reporting</Link>
      <Link href="/rules" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Rules</Link>
      <Link href="/teams" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Teams</Link>
      <Link href="/settings" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Settings</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-8 w-8 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">ƒ</span>
          <span className="text-lg">FlowBank</span>
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">Dashboard</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <BillingPortalButton customerId={stripeCustomerId ?? null} />
          <form action="/api/sessionLogout" method="post">
            <Button variant="outline" type="submit">
              Log out
            </Button>
          </form>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center rounded-lg border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-2 py-3">
            <NavLinks />
            <div className="mt-2 flex gap-2">
              <BillingPortalButton customerId={stripeCustomerId ?? null} className="w-full justify-center" />
              <form action="/api/sessionLogout" method="post" className="w-full">
                <Button variant="outline" type="submit" className="w-full">
                  Log out
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
