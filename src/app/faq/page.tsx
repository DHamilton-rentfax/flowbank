
"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is FlowBank?",
    answer: "FlowBank is a financial automation tool designed for freelancers and small businesses. It helps you automatically allocate your income into different 'virtual' accounts for things like taxes, profit, owner's pay, and operating expenses, based on the Profit First methodology."
  },
  {
    question: "How do I connect my bank account?",
    answer: "You can securely connect your bank account during the onboarding process or from the dashboard using our integration with Plaid. Plaid uses bank-level encryption and never shares your login credentials with us."
  },
  {
    question: "What is an automatic allocation?",
    answer: "When you receive a deposit into your connected bank account, FlowBank's automation feature (available on paid plans) will automatically split that income into your designated virtual accounts according to the percentage rules you've set up."
  },
  {
    question: "Can I cancel my plan at any time?",
    answer: "Yes, you can cancel your subscription at any time from the 'Manage Billing' section in your dashboard. Your plan will remain active until the end of the current billing period, and you will not be charged again."
  },
  {
    question: "What’s the difference between the Starter and Pro plans?",
    answer: "The Starter plan offers basic automation and AI suggestions, which is great for getting started. The Pro plan unlocks advanced features like our full AI Financial Advisor, multi-bank support, team management, and priority support, making it ideal for growing businesses."
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We take security very seriously. We use Plaid to connect to your bank, which means we never see or store your bank credentials. All your data is encrypted both in transit and at rest."
  },
  {
    question: "How do AI Suggestions work?",
    answer: "Our AI analyzes your transaction history to identify potential tax deductions, suggest ways to save money (like redundant subscriptions), and provide a summary of your spending habits. This feature is available on the Pro plan or as a separate add-on."
  },
  {
    question: "What is a split rule?",
    answer: "A split rule (or allocation rule) is a rule you define in FlowBank to tell the system what percentage of your income should go into each of your virtual accounts. For example, you might create a 'Taxes' rule to set aside 25% of all income."
  }
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary py-12">
        <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
                <p className="text-muted-foreground mt-2">Find answers to common questions about FlowBank.</p>
            </div>

            <Accordion type="single" collapsible className="w-full bg-background p-4 sm:p-6 rounded-lg border">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
}
