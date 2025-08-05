
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from 'next/image';

const features = [
    {
        title: "Connect Your Bank",
        description: "Securely link your bank accounts in seconds using Plaid."
    },
    {
        title: "Define Your Rules",
        description: "Create percentage-based rules to split your income automatically."
    },
    {
        title: "Watch Your Money Flow",
        description: "Income is automatically detected and allocated to your categories."
    }
];

const benefits = [
    "Eliminate spreadsheets and manual transfers.",
    "Inspired by the popular 'Profit First' methodology.",
    "Perfect for solopreneurs, freelancers, and small businesses.",
    "Gain clarity and control over your cash flow."
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
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
        {/* Hero Section */}
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-headline">
                    Split. Stash. <span className="text-primary">Scale your profits.</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                    FlowBank is a financial automation app that allows entrepreneurs and individuals to automatically split their income into custom categories. Let your money flow where it matters most.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Button asChild size="lg">
                    <Link href="/signup">
                        Get Started for Free
                        <ArrowRight className="ml-2" />
                    </Link>
                    </Button>
                </div>
                 <div className="mt-16 w-full max-w-4xl mx-auto">
                    <Card className="shadow-2xl dark:shadow-primary/10">
                       <Image 
                        src="https://placehold.co/1200x600.png"
                        alt="FlowBank Dashboard"
                        width={1200}
                        height={600}
                        className="rounded-t-lg"
                        data-ai-hint="finance dashboard"
                        />
                        <div className="p-4 bg-muted/30 rounded-b-lg border-t text-sm text-muted-foreground text-left">
                            <p><strong>How it works:</strong> Inspired by the “Profit First” method, FlowBank eliminates budgeting anxiety.</p>
                        </div>
                    </Card>
                 </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-24 bg-card border-y">
             <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Three Steps to Financial Clarity</h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">Get set up in minutes and take control of your income.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {features.map((feature, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold font-headline">{index + 1}</div>
                            </div>
                            <h3 className="text-xl font-bold font-headline mt-6 mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
             </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 md:py-24">
             <div className="container mx-auto px-4 sm:px-6">
                 <div className="grid md:grid-cols-2 gap-12 items-center">
                     <div>
                        <Image 
                            src="https://placehold.co/600x400.png"
                            alt="Financial Goals"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-lg"
                            data-ai-hint="freelancer working"
                        />
                     </div>
                     <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Your Money, on Autopilot.</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Stop wasting time with manual calculations. FlowBank empowers you to build a robust financial system that runs itself.
                        </p>
                        <ul className="mt-6 space-y-4">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircle2 className="h-6 w-6 text-secondary mr-3 mt-1 shrink-0" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                     </div>
                 </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
