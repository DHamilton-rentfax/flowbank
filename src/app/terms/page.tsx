
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
    return (
        <div className="flex flex-col min-h-screen">
             <header className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="size-8 text-primary" />
                    <h1 className="text-2xl font-bold font-headline">FlowBank</h1>
                </Link>
                <nav className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_URL!} target="_blank">Pricing</Link>
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
            </header>
            <main className="flex-1">
                <div className="container mx-auto max-w-3xl py-12 px-4">
                    <div className="prose dark:prose-invert max-w-none">
                        <h1 className="font-headline">Terms of Service</h1>
                        <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>
                        
                        <h2>1. Agreement to Terms</h2>
                        <p>By using our application, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the application.</p>
                        
                        <h2>2. Description of Service</h2>
                        <p>FlowBank provides users with tools to manage their finances by automatically allocating income based on user-defined rules. The service is provided "as is" and we make no guarantees regarding its reliability or suitability for your needs.</p>

                        <h2>3. User Accounts</h2>
                        <p>You are responsible for safeguarding your account and for any activities or actions under your account. We are not liable for any loss or damage arising from your failure to comply with this security obligation.</p>
                        
                        <h2>4. Prohibited Activities</h2>
                        <p>You agree not to use the service for any illegal or unauthorized purpose. You agree to comply with all laws, rules, and regulations applicable to your use of the service.</p>

                        <h2>5. Limitation of Liability</h2>
                        <p>In no event shall FlowBank be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

                        <h2>6. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is based, without regard to its conflict of law provisions.</p>
                        
                        <h2>7. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us at: <a href="mailto:support@flowbank.ai">support@flowbank.ai</a>.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
