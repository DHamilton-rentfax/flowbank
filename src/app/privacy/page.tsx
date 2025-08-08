
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                <div className="container mx-auto max-w-3xl py-12 px-4">
                    <div className="prose dark:prose-invert max-w-none">
                        <h1 className="font-headline">Privacy Policy</h1>
                        <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>
                        <p>Flow Bank (“we,” “our,” “us”) is committed to protecting your privacy and maintaining the confidentiality and security of your personal and financial information. This Privacy Policy explains how we collect, use, store, and share your information when you use our services.</p>
                        <p>By using Flow Bank, you agree to the practices described in this Privacy Policy. If you do not agree with this policy, please do not use our services.</p>
                        
                        <h2>1. Information We Collect</h2>
                        <p>We collect information to operate effectively, provide you with our services, and meet legal and compliance requirements.</p>

                        <h3>A. Information You Provide Directly</h3>
                        <ul>
                            <li><strong>Account Information</strong> – Name, email address, phone number, date of birth, business name, and business details when registering.</li>
                            <li><strong>Authentication Data</strong> – Passwords, security questions, two-factor authentication details.</li>
                            <li><strong>Financial Information</strong> – Bank account details, payment information, and tax-related information.</li>
                            <li><strong>Uploaded Documents</strong> – Identity verification documents (e.g., driver’s license, passport) for KYC compliance.</li>
                            <li><strong>Customer Support</strong> – Communications via email, chat, or phone.</li>
                        </ul>

                        <h3>B. Information We Collect Automatically</h3>
                        <ul>
                            <li><strong>Device and Usage Data</strong> – IP address, browser type, operating system, and device identifiers.</li>
                            <li><strong>Cookies and Tracking</strong> – Session cookies, analytics data, and user interaction logs to improve services.</li>
                            <li><strong>Transaction Data</strong> – Details of transfers, allocations, deposits, withdrawals, and payment activities.</li>
                        </ul>

                        <h3>C. Information from Third Parties</h3>
                        <ul>
                            <li><strong>Stripe</strong> – For payment processing, identity verification, and financial transactions.</li>
                            <li><strong>Plaid / Stripe Financial Connections</strong> – For securely connecting to your bank account to verify ownership and retrieve transaction data.</li>
                            <li><strong>Firebase</strong> – For authentication, security, and app performance monitoring.</li>
                            <li><strong>AI Coach Integration</strong> – Uses your account data to provide personalized savings, investment, and tax recommendations.</li>
                        </ul>

                        <h2>2. How We Use Your Information</h2>
                        <p>We process your information for the following purposes:</p>
                        <ol>
                            <li><strong>To Provide Our Services</strong> – Enabling payouts, automated allocations, and financial insights.</li>
                            <li><strong>To Verify Your Identity</strong> – Complying with KYC/AML regulations and fraud prevention.</li>
                            <li><strong>To Process Transactions</strong> – Through secure third-party payment processors (e.g., Stripe).</li>
                            <li><strong>To Improve Our Platform</strong> – Using analytics to enhance performance and usability.</li>
                            <li><strong>To Provide AI-Powered Recommendations</strong> – Offering financial guidance tailored to your account activity.</li>
                            <li><strong>To Communicate With You</strong> – Regarding your account, security alerts, product updates, and support.</li>
                            <li><strong>To Meet Legal Obligations</strong> – Complying with applicable laws, regulations, and enforcement requests.</li>
                        </ol>

                        <h2>3. How We Share Your Information</h2>
                        <p>We do not sell your personal data. We share your information only in the following cases:</p>
                        <ul>
                            <li><strong>Service Providers</strong> – With trusted partners like Stripe, Firebase, and Plaid to process payments, verify accounts, and manage infrastructure.</li>
                            <li><strong>Compliance & Legal Requirements</strong> – With regulators, law enforcement, or government agencies as required by law.</li>
                            <li><strong>Business Transfers</strong> – In case of a merger, acquisition, or sale of assets.</li>
                            <li><strong>With Your Consent</strong> – When you authorize third-party integrations.</li>
                        </ul>

                        <h2>4. Data Security</h2>
                        <p>We implement industry-standard security measures to protect your information, including:</p>
                        <ul>
                            <li><strong>Encryption</strong> – Data encrypted in transit (TLS) and at rest (AES-256).</li>
                            <li><strong>Access Controls</strong> – Role-based access for internal systems.</li>
                            <li><strong>Fraud Monitoring</strong> – AI-driven anomaly detection to prevent unauthorized access and fraudulent activity.</li>
                            <li><strong>Regular Audits</strong> – Ongoing security reviews and penetration testing.</li>
                        </ul>

                        <h2>5. Data Retention</h2>
                        <p>We retain your personal information for as long as necessary to:</p>
                        <ul>
                            <li>Provide services and maintain your account.</li>
                            <li>Comply with legal and regulatory obligations.</li>
                            <li>Resolve disputes and enforce agreements.</li>
                        </ul>
                        <p>When data is no longer required, it will be securely deleted or anonymized.</p>

                        <h2>6. Your Rights</h2>
                        <p>Depending on your jurisdiction, you may have the right to:</p>
                        <ul>
                            <li>Access and request a copy of your personal data.</li>
                            <li>Correct or update inaccurate information.</li>
                            <li>Request deletion of your data (subject to legal requirements).</li>
                            <li>Restrict or object to certain processing activities.</li>
                            <li>Port your data to another service.</li>
                        </ul>
                        <p>To exercise your rights, contact us at <a href="mailto:support@flowbank.ai">support@flowbank.ai</a>.</p>

                        <h2>7. International Data Transfers</h2>
                        <p>Flow Bank currently stores all personal and financial data in the United States. If you access our services from outside the U.S., your information will be transferred and processed in the United States.</p>

                        <h2>8. Children’s Privacy</h2>
                        <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect information from children.</p>

                        <h2>9. Changes to This Privacy Policy</h2>
                        <p>We may update this Privacy Policy from time to time. Changes will be posted on our website, and the effective date will be updated accordingly.</p>

                        <h2>10. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us:</p>
                        <p>
                            <strong>Flow Bank</strong><br />
                            Email: <a href="mailto:support@flowbank.ai">support@flowbank.ai</a><br />
                            Website: <a href="https://www.flowbank.ai" target="_blank" rel="noopener noreferrer">www.flowbank.ai</a>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
