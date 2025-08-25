"use client";

import Link from "next/link";
import { useState } from "react";
import BillingPortalButton from "./BillingPortalButton";

export default function HeaderDashboard({
  stripeCustomerId,
}: {
  stripeCustomerId?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link href="/dashboard" className="text-sm text-gray-700 hover:text-black">Overview</Link>
      <Link href="/reporting" className="text-sm text-gray-700 hover:text-black">Reporting</Link>
      <Link href="/splits" className="text-sm text-gray-700 hover:text-black">Splits</Link>
      <Link href="/teams" className="text-sm text-gray-700 hover:text-black">Teams</Link>
      <Link href="/settings" className="text-sm text-gray-700 hover:text-black">Settings</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-8 w-8 rounded-xl bg-black text-white grid place-items-center">ƒ</span>
          <span className="text-lg">FlowBank</span>
          <span className="ml-2 rounded-full bg-gray-900/5 px-2 py-0.5 text-xs text-gray-600">Dashboard</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <BillingPortalButton customerId={stripeCustomerId ?? null} />
          <form action="/api/sessionLogout" method="post">
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50" formMethod="post">
              Log out
            </button>
          </form>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center rounded-lg border px-3 py-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3">
            <NavLinks />
            <div className="mt-2 flex gap-2">
              <BillingPortalButton customerId={stripeCustomerId ?? null} className="w-full justify-center" />
              <form action="/api/sessionLogout" method="post" className="w-full">
                <button className="w-full rounded-lg border px-3 py-2 text-sm" formMethod="post">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}