"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function HeaderPublic() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {/* You can use an SVG or an emoji for the logo */}
            <span className="inline-block h-8 w-8 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">ƒ</span>
            <span className="text-lg">FlowBank</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">How it works</Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Pricing</Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Blog</Link>
          <Link href="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">FAQ</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
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
            <Link href="/how-it-works" className="py-1 text-sm font-medium text-muted-foreground">How it works</Link>
            <Link href="/pricing" className="py-1 text-sm font-medium text-muted-foreground">Pricing</Link>
            <Link href="/blog" className="py-1 text-sm font-medium text-muted-foreground">Blog</Link>
            <Link href="/faq" className="py-1 text-sm font-medium text-muted-foreground">FAQ</Link>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
