
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { useState }from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

const navLinks = [
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
];

export function Header() {
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
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
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
                {navLinks.map(link => (
                    <Button variant="ghost" asChild key={link.href}>
                        <Link href={link.href}>{link.label}</Link>
                    </Button>
                ))}
                <Button variant="ghost" asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Get Started</Link>
                </Button>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between border-b pb-4">
                                <Link href="/" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-2">
                                    <Logo className="size-8 text-primary" />
                                    <span className="text-xl font-bold">FlowBank</span>
                                </Link>
                                <SheetClose asChild>
                                    <Button variant="ghost" size="icon">
                                        <X />
                                        <span className="sr-only">Close menu</span>
                                    </Button>
                                </SheetClose>
                            </div>
                            <nav className="flex flex-col gap-4 py-6 flex-1">
                                {navLinks.map(link => (
                                    <SheetClose asChild key={link.href}>
                                        <Link href={link.href} className="text-lg font-medium hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                ))}
                            </nav>
                             <div className="mt-auto border-t pt-6 flex flex-col gap-2">
                                <SheetClose asChild>
                                    <Button variant="outline" asChild>
                                        <Link href="/login">Sign In</Link>
                                    </Button>
                                </SheetClose>
                                 <SheetClose asChild>
                                    <Button asChild>
                                        <Link href="/signup">Get Started</Link>
                                    </Button>
                                </SheetClose>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </header>
    );
}
