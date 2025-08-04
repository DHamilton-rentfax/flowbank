
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";

const faqs = [
    {
        question: "What is Flow Bank?",
        answer: "Flow Bank is a smart financial tool that helps you automatically allocate your income into different categories based on rules you set. It's designed to help freelancers, small business owners, and individuals manage their finances effortlessly."
    },
    {
        question: "How does the income allocation work?",
        answer: "You define a set of allocation rules in the settings, such as 'Taxes: 25%' or 'Savings: 15%'. When you add an income transaction, Flow Bank automatically divides the amount according to these percentages and updates your account balances."
    },
    {
        question: "Is my financial data secure?",
        answer: "Yes. We use Plaid to securely connect to your bank accounts. Plaid is a trusted financial technology company that uses end-to-end encryption. We never see or store your bank login credentials."
    },
    {
        question: "How does the AI Plan Generator work?",
        answer: "Our AI Plan Generator uses a large language model to suggest a tailored allocation plan based on your business type. Just enter a description of your business, and the AI will provide a recommended set of rules that you can apply and customize."
    },
    {
        question: "Can I use Flow Bank on multiple devices?",
        answer: "Yes! All your data—accounts, rules, and transactions—is securely stored in the cloud using Firebase Firestore. This means you can log in from any device and always have access to your up-to-date financial information."
    }
]

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
                <Logo className="size-7 text-primary" />
                <h1 className="text-xl font-semibold">Flow Bank</h1>
            </Link>
            </div>
            <nav>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Blog
            </Link>
            </nav>
      </header>
       <main className="flex-1">
         <div className="container mx-auto max-w-3xl py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Have a question? We're here to help.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
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
