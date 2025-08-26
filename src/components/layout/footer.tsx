import Link from "next/link";

export function Footer() {
 return (
 <footer className="border-t bg-card">
 <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
 <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FlowBank. All rights reserved.</p>
 <nav className="flex items-center gap-4 text-sm text-muted-foreground">
 <Link href="/privacy" className="transition-colors hover:text-primary">Privacy</Link>
 <Link href="/terms" className="transition-colors hover:text-primary">Terms</Link>
 <Link href="/contact" className="transition-colors hover:text-primary">Contact</Link>
 </nav>
 </div>
 </footer>
 );
}
