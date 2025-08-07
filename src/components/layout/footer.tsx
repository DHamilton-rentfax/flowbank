
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-card text-card-foreground border-t">
            <div className="container mx-auto max-w-6xl py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Logo className="size-7 text-primary" />
                            <span className="text-xl font-bold font-headline">FlowBank</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Let your money flow where it matters most.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
                         <div>
                            <h4 className="font-semibold mb-3 font-headline">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-semibold mb-3 font-headline">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-3 font-headline">Contact Us</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Mail className="size-4" />
                                    <a href="mailto:support@flowbank.ai" className="hover:text-primary transition-colors">support@flowbank.ai</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="size-4" />
                                     <a href="tel:833-513-3330" className="hover:text-primary transition-colors">833-513-3330</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} FlowBank. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
