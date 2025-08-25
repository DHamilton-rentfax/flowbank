"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeaderPublic() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-block h-8 w-8 rounded-xl bg-black text-white grid place-items-center">ƒ</span>
            <span className="text-lg">FlowBank</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/how-it-works" className="text-sm text-gray-700 hover:text-black">How it works</Link>
          <Link href="/pricing" className="text-sm text-gray-700 hover:text-black">Pricing</Link>
          <Link href="/blog" className="text-sm text-gray-700 hover:text-black">Blog</Link>
          <Link href="/faq" className="text-sm text-gray-700 hover:text-black">FAQ</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm text-gray-700 hover:text-black">Log in</Link>
          <Link
            href="/signup"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Get started
          </Link>
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
            <Link href="/how-it-works" className="py-1 text-sm">How it works</Link>
            <Link href="/pricing" className="py-1 text-sm">Pricing</Link>
            <Link href="/blog" className="py-1 text-sm">Blog</Link>
            <Link href="/faq" className="py-1 text-sm">FAQ</Link>
            <div className="mt-2 flex gap-2">
              <Link href="/login" className="rounded-lg border px-3 py-2 text-sm">Log in</Link>
              <Link href="/signup" className="rounded-lg bg-black px-3 py-2 text-sm text-white">Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}