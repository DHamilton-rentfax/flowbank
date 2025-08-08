
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";

export function Header() {
    const pathname = usePathname();
    
    // Don't show the public header on dashboard routes
    if (pathname.startsWith('/dashboard')) {
        return null;
    }

    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">FlowBank</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/faq">FAQ</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Get Started</Link>
            </Button>
            </nav>
        </div>
      </header>
    );
}
