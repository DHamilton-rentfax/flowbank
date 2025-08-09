
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo, StripeLogo, PlaidLogo, Zap, Shuffle, BarChartBig, Link2, Bot, ShieldCheck, Banknote, FirebaseLogo, GoogleAiLogo } from "@/components/icons";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";

const howItWorks = [
    {
        step: 1,
        title: "Connect Your Revenue",
        description: "Securely link your Stripe account to capture incoming payments, or connect your bank accounts with Plaid to monitor income deposits.",
        image: "https://placehold.co/1200x800.png",
        aiHint: "financial connection",
    },
    {
        step: 2,
        title: "Define Your Rules",
        description: "Create custom rules based on percentages or fixed dollar amounts. Not sure where to start? Our AI can generate a plan for you.",
        image: "https://placehold.co/1200x800.png",
        aiHint: "allocation rules"
    },
    {
        step: 3,
        title: "Automate Your Cash Flow",
        description: "FlowBank automatically detects income and allocates it to your virtual accounts, giving you a real-time view of your finances.",
        image: "https://placehold.co/1200x800.png",
        aiHint: "dashboard chart"
    }
];

const features = [
    {
        icon: <Shuffle />,
        title: "Automated Allocations",
        description: "Inspired by Profit First, our system automatically divides your income into virtual accounts based on your rules."
    },
    {
        icon: <Link2 />,
        title: "Payment Links",
        description: "Generate and share Stripe payment links directly from your dashboard to get paid by clients with ease."
    },
    {
        icon: <Bot />,
        title: "AI-Powered Plans",
        description: "Tell our AI about your business, and it will generate a tailored allocation plan to get you started in seconds."
    },
    {
        icon: <BarChartBig />,
        title: "Insightful Reporting",
        description: "Visualize your allocation history and rule breakdown with simple, clear charts and reports."
    }
]

const addOns = [
    {
        icon: <Zap />,
        title: "Instant Payouts",
        description: "Access your funds immediately with our pay-per-use or unlimited monthly plan."
    },
     {
        icon: <Banknote />,
        title: "Tax Vault",
        description: "Automatically set aside a percentage of your income for taxes so you're never caught off guard."
    },
    {
        icon: <ShieldCheck />,
        title: "Smart Forecasting",
        description: "Leverage AI to predict future cash flow and make smarter financial decisions."
    }
]


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-headline">
                    Your Money, <span className="text-primary">Perfectly Allocated.</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                    FlowBank is the smart financial engine for entrepreneurs. Automate your income splitting, get paid by clients, and achieve financial clarity without the spreadsheets.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Button asChild size="lg">
                    <Link href="/signup">
                        Get Started for Free
                        <ArrowRight className="ml-2" />
                    </Link>
                    </Button>
                </div>
                 <div className="mt-16 text-center">
                    <p className="text-sm text-muted-foreground font-semibold mb-4">POWERED BY INDUSTRY LEADERS</p>
                    <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
                        <StripeLogo className="h-8 text-muted-foreground" />
                        <PlaidLogo className="h-12 text-muted-foreground" />
                        <FirebaseLogo className="h-8 text-muted-foreground" />
                        <GoogleAiLogo className="h-6 text-muted-foreground" />
                    </div>
                 </div>
                 <div className="relative mt-20 max-w-5xl mx-auto">
                    <Image 
                        src="https://placehold.co/1200x750.png"
                        alt="FlowBank Dashboard"
                        width={1200}
                        height={750}
                        className="rounded-lg shadow-2xl"
                        data-ai-hint="dashboard analytics"
                        priority
                    />
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-24 bg-card border-y">
             <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Three Steps to Financial Autopilot</h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">Go from financial stress to streamlined success in minutes.</p>
                </div>

                <div className="space-y-16">
                    {howItWorks.map((item, index) => (
                        <div key={item.step} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div className={cn("order-2", index % 2 === 0 ? "md:order-1" : "md:order-2")}>
                                <div className="mb-4 flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold font-headline shrink-0">{item.step}</div>
                                     <h3 className="text-2xl font-bold font-headline">{item.title}</h3>
                                </div>
                                <p className="text-muted-foreground text-lg">{item.description}</p>
                            </div>
                            <div className={cn("order-1", index % 2 === 0 ? "md:order-2" : "md:order-1")}>
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={1200}
                                    height={800}
                                    className="rounded-lg shadow-lg"
                                    data-ai-hint={item.aiHint}
                                />
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-24">
             <div className="container mx-auto px-4 sm:px-6">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">A Smarter Way to Manage Money</h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">FlowBank is more than just an app—it's your dedicated financial system.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="text-center p-6">
                           <div className="flex justify-center mb-4">
                             <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                {feature.icon}
                             </div>
                           </div>
                           <h3 className="text-lg font-bold font-headline mb-2">{feature.title}</h3>
                           <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="py-20 md:py-24 bg-card border-y">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center">
                     <Image 
                        src="https://placehold.co/100x100.png"
                        alt="Customer photo"
                        width={100}
                        height={100}
                        className="rounded-full mx-auto mb-4"
                        data-ai-hint="happy person"
                     />
                    <blockquote className="text-xl md:text-2xl font-medium">
                        "FlowBank completely changed how I handle my business finances. I used to spend hours in spreadsheets, and now it's all automated. I finally have clarity and peace of mind."
                    </blockquote>
                    <cite className="mt-4 block font-semibold not-italic">
                        Sarah Johnson, Founder of SJ Creative
                    </cite>
                </div>
            </div>
        </section>

         {/* Add-ons Section */}
        <section id="add-ons" className="py-20 md:py-24">
             <div className="container mx-auto px-4 sm:px-6">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Supercharge Your Finances</h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">Elevate your financial toolkit with powerful, optional add-ons.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {addOns.map((addOn, index) => (
                        <div key={index} className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-1">
                             {addOn.icon}
                           </div>
                           <div>
                            <h3 className="text-lg font-bold font-headline">{addOn.title}</h3>
                            <p className="text-muted-foreground">{addOn.description}</p>
                           </div>
                        </div>
                     ))}
                </div>
            </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
                    Ready to Take Control of Your Cash Flow?
                </h2>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Stop guessing and start allocating. Join hundreds of entrepreneurs who trust FlowBank to automate their finances and build a more profitable business.
                </p>
                <div className="mt-10 flex justify-center">
                    <Button asChild size="lg">
                    <Link href="/signup">
                        Sign Up and Start for Free
                        <ArrowRight className="ml-2" />
                    </Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
