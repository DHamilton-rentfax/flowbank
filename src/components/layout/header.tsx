"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock page scroll when menu is open
  useEffect(() => {
    const root = document.documentElement;
    if (open) root.classList.add("overflow-hidden");
    else root.classList.remove("overflow-hidden");
    return () => root.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-black/5 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/55">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="FlowBank" width={28} height={28} />
            <span className="text-lg font-semibold tracking-tight">FlowBank</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  "text-sm transition-colors " +
                  (pathname === href ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900")
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Get started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Full-screen mobile menu */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between border-b px-4 sm:px-6">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <img src="/logo.svg" alt="FlowBank" width={24} height={24} />
              <span className="text-base font-semibold">FlowBank</span>
            </Link>
            <button
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <ul className="space-y-2">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={
                      "block rounded-lg px-3 py-2 text-lg " +
                      (pathname === href ? "bg-gray-100 text-gray-900" : "text-gray-800 hover:bg-gray-50")
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-black px-3 py-2 text-center text-sm font-medium text-white hover:opacity-90"
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}