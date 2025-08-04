
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/icons";
import Link from "next/link";

export default function TermsOfServicePage() {
    return (
        <div className="flex flex-col min-h-screen">
             <header className="p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="size-7 text-primary" />
                        <h1 className="text-xl font-bold font-headline">FlowBank</h1>
                    </Link>
                </div>
                <nav>
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Login
                    </Link>
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
                        <p>If you have any questions about these Terms, please contact us at: <a href="mailto:support@flowbank.app">support@flowbank.app</a>.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
