
import Link from "next/link";

export function Footer() {
 return (
 <footer className="border-t bg-white">
 <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
 <p className="text-sm text-gray-600">© {new Date().getFullYear()} FlowBank. All rights reserved.</p>
 <nav className="flex items-center gap-4 text-sm text-gray-600">
 <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
 <Link href="/terms" className="hover:text-gray-900">Terms</Link>
 <Link href="/contact" className="hover:text-gray-900">Contact</Link>
 </nav>
 </div>
 </footer>
 );
}
