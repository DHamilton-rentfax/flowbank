
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                <div className="container mx-auto max-w-3xl py-12 px-4">
                    <div className="prose dark:prose-invert max-w-none">
                        <h1 className="font-headline">Terms of Service</h1>
                        <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>
                        <p>Welcome to Flow Bank (“we,” “our,” “us”). These Terms of Service (“Terms”) govern your access to and use of our website, mobile applications, and related services (collectively, the “Services”). By creating an account or using our Services, you agree to be bound by these Terms and our <strong>Privacy Policy</strong>.</p>
                        <p>If you do not agree to these Terms, please do not use the Services.</p>

                        <h2>1. Eligibility</h2>
                        <ul>
                            <li>You must be <strong>at least 18 years old</strong> and capable of entering into a legally binding agreement.</li>
                            <li>You may not use Flow Bank if you are located in a country or territory subject to U.S. sanctions or if you are on any restricted or prohibited list issued by the U.S. government.</li>
                            <li>Business accounts must be created by an authorized representative of the entity.</li>
                        </ul>

                        <h2>2. Description of Services</h2>
                        <p>Flow Bank provides a financial automation platform that includes, but is not limited to:</p>
                        <ul>
                            <li><strong>Automated Payouts</strong> – Schedule and send payments to connected accounts via Stripe.</li>
                            <li><strong>Smart Allocation Rules</strong> – Divide income into savings, investments, marketing, and other accounts.</li>
                            <li><strong>AI-Powered Financial Coaching</strong> – Personalized saving, investing, and tax strategies.</li>
                            <li><strong>Instant Payouts & Add-ons</strong> – Optional features for faster transfers and enhanced tools.</li>
                            <li><strong>Security & Compliance</strong> – KYC/AML verification, fraud prevention, and account monitoring.</li>
                        </ul>
                        <p>We may update or change the Services at any time without prior notice.</p>
                        
                        <h2>3. Account Registration & Security</h2>
                        <ul>
                            <li>You must provide accurate, complete, and updated information when creating an account.</li>
                            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                            <li>You must immediately notify us at <a href="mailto:support@flowbank.ai">support@flowbank.ai</a> of any unauthorized access or security breach.</li>
                            <li>You are responsible for all activities that occur under your account.</li>
                        </ul>

                        <h2>4. Third-Party Services</h2>
                        <p>Flow Bank integrates with third-party providers, including:</p>
                        <ul>
                            <li><strong>Stripe</strong> for payments, payouts, and financial connections.</li>
                            <li><strong>Plaid</strong> (via Stripe Financial Connections) for bank account linking and transaction retrieval.</li>
                            <li><strong>Firebase</strong> for authentication, hosting, and analytics.</li>
                        </ul>
                        <p>Use of these services is subject to their own terms and policies.</p>

                        <h2>5. Fees & Payments</h2>
                        <ul>
                            <li>Some Services are provided free of charge; others require a paid subscription.</li>
                            <li>Pricing tiers (Free, Starter, Pro, Business) are outlined on our website and may change with notice.</li>
                            <li>Optional add-ons (e.g., Instant Payouts, AI Coaching) may be billed separately.</li>
                            <li>You authorize us to charge your provided payment method for subscription fees and any applicable taxes.</li>
                            <li>Fees are <strong>non-refundable</strong> except as required by law.</li>
                        </ul>

                        <h2>6. Refunds & Chargebacks</h2>
                        <ul>
                            <li>You are responsible for all refunds, chargebacks, and associated fees related to your account.</li>
                            <li>We may suspend or terminate accounts with excessive chargeback activity.</li>
                        </ul>

                        <h2>7. Compliance & Acceptable Use</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use the Services for illegal, harmful, or fraudulent purposes.</li>
                            <li>Violate any applicable laws, including anti-money laundering (AML) and know-your-customer (KYC) regulations.</li>
                            <li>Sell or promote restricted goods or services listed in Stripe’s <a href="https://stripe.com/restricted-businesses" target="_blank" rel="noopener noreferrer">Prohibited & Restricted Businesses</a>.</li>
                        </ul>
                        <p>We may suspend or terminate your account for violations of these rules.</p>
                        
                        <h2>8. Identity Verification</h2>
                        <p>To comply with financial regulations and prevent fraud:</p>
                        <ul>
                            <li>We may require you to submit government-issued identification or other verification documents.</li>
                            <li>We may verify your identity via third-party providers.</li>
                            <li>Failure to complete verification may limit or block your access to certain features.</li>
                        </ul>

                        <h2>9. Data Usage & Privacy</h2>
                        <ul>
                            <li>We collect and use your data in accordance with our <strong>Privacy Policy</strong>.</li>
                            <li>We may share information with service providers as needed to operate the Services.</li>
                            <li>You are responsible for ensuring that your use of Flow Bank complies with applicable data protection laws.</li>
                        </ul>

                        <h2>10. Service Availability</h2>
                        <ul>
                            <li>We strive to keep the Services available 24/7 but do not guarantee uninterrupted or error-free operation.</li>
                            <li>Maintenance or technical issues may temporarily limit access.</li>
                        </ul>

                        <h2>11. Termination</h2>
                        <p>We may suspend or terminate your account if:</p>
                        <ul>
                            <li>You violate these Terms or applicable laws.</li>
                            <li>You engage in fraud or misuse of the Services.</li>
                            <li>You fail to pay fees when due.</li>
                        </ul>
                        <p>Upon termination, your right to use the Services will immediately end, but we may retain certain data as required by law.</p>

                        <h2>12. Disclaimers & Limitation of Liability</h2>
                        <ul>
                            <li><strong>No Financial Advice</strong> – Flow Bank’s AI Coach provides educational suggestions, not professional financial, tax, or investment advice.</li>
                            <li>We are not responsible for losses from actions you take based on our platform’s recommendations.</li>
                            <li>We are not liable for any indirect, incidental, or consequential damages.</li>
                        </ul>

                        <h2>13. Changes to Terms</h2>
                        <p>We may update these Terms from time to time. Updated Terms will be posted on <a href="https://www.flowbank.ai" target="_blank" rel="noopener noreferrer">www.flowbank.ai</a> and will take effect immediately unless otherwise stated.</p>

                        <h2>14. Governing Law & Dispute Resolution</h2>
                        <ul>
                            <li>These Terms are governed by the laws of the State of <strong>New York</strong>, without regard to conflict of law principles.</li>
                            <li>Any disputes will be resolved in the state or federal courts located in <strong>New York County, NY</strong>.</li>
                        </ul>

                        <h2>15. Contact Us</h2>
                        <p>If you have questions about these Terms, contact us:</p>
                        <p>
                            <strong>Flow Bank</strong><br />
                            Website: <a href="https://www.flowbank.ai" target="_blank" rel="noopener noreferrer">www.flowbank.ai</a><br />
                            Email: <a href="mailto:support@flowbank.ai">support@flowbank.ai</a>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
