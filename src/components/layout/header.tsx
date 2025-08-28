"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HeaderPublic() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Close menu when navigating to a new route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click & Esc
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
              ƒ
            </span>
            <span className="text-lg">FlowBank</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            How it works
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Blog
          </Link>
          <Link href="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            FAQ
          </Link>
        </nav>

        {/* Desktop CTAs */}
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
          ref={btnRef}
          type="button"
          className="inline-flex items-center rounded-lg border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" ref={menuRef} className="border-t bg-white md:hidden">
          <div className="container mx-auto flex flex-col gap-2 py-3">
            <Link href="/how-it-works" className="py-1 text-sm font-medium text-foreground">
              How it works
            </Link>
            <Link href="/pricing" className="py-1 text-sm font-medium text-foreground">
              Pricing
            </Link>
            <Link href="/blog" className="py-1 text-sm font-medium text-foreground">
              Blog
            </Link>
            <Link href="/faq" className="py-1 text-sm font-medium text-foreground">
              FAQ
            </Link>
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
