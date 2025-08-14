
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-neutral-50 border-t">
            <div className="container mx-auto max-w-6xl py-8 px-4 text-center text-sm text-neutral-600">
                <p>&copy; {new Date().getFullYear()} FlowBank. All rights reserved.</p>
                <nav className="flex justify-center gap-4 mt-2">
                    <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                    <Link href="/terms" className="hover:underline">Terms of Service</Link>
                </nav>
            </div>
        </footer>
    )
}
