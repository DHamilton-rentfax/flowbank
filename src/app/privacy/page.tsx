
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen">
             <header className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
            </header>
            <main className="flex-1">
                <div className="container mx-auto max-w-3xl py-12 px-4">
                    <div className="prose dark:prose-invert max-w-none">
                        <h1 className="font-headline">Privacy Policy</h1>
                        <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>
                        
                        <h2>1. Introduction</h2>
                        <p>Welcome to FlowBank. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

                        <h2>2. Information We Collect</h2>
                        <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                        <ul>
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the application.</li>
                            <li><strong>Financial Data:</strong> We use Plaid to connect to your bank accounts. We do not store your bank credentials. We only receive tokenized access to view transaction data.</li>
                        </ul>

                        <h2>3. Use of Your Information</h2>
                        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
                        <ul>
                            <li>Create and manage your account.</li>
                            <li>Process transactions and send you related information, including confirmations and invoices.</li>
                            <li>Monitor and analyze usage and trends to improve your experience.</li>
                        </ul>

                        <h2>4. Disclosure of Your Information</h2>
                        <p>We do not share your information with any third parties except as required by law.</p>

                        <h2>5. Security of Your Information</h2>
                        <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

                        <h2>6. Contact Us</h2>
                        <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:support@flowbank.ai">support@flowbank.ai</a>.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
