
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "For individuals getting started.",
        features: [
            "1 Bank Connection",
            "3 Split Rules",
            "Manual Splits",
            "Basic Reporting"
        ],
        cta: "Get Started"
    },
    {
        name: "Pro",
        price: "$9.99",
        description: "For solopreneurs and freelancers.",
        features: [
            "Unlimited Split Rules",
            "Automated Splits",
            "Advanced Reporting",
            "Email & Chat Support"
        ],
        cta: "Start Pro Trial",
        popular: true
    },
    {
        name: "Business",
        price: "$29.99",
        description: "For small businesses and teams.",
        features: [
            "All Pro Features",
            "Multi-account sync",
            "Team Splits & Permissions",
            "Priority Support"
        ],
        cta: "Contact Sales"
    }
]

export default function PricingPage() {
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
                <div className="container mx-auto max-w-5xl py-12 px-4">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">Find the perfect plan for your flow.</h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Start for free, then scale as you grow. No hidden fees.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                                <CardHeader>
                                    <CardTitle className="font-headline">{plan.name}</CardTitle>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold font-headline">{plan.price}</span>
                                        <span className="text-muted-foreground">/ month</span>
                                    </div>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center">
                                                <Check className="h-5 w-5 text-primary mr-2" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                                        {plan.cta}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                         <h2 className="text-2xl font-bold font-headline">Need more?</h2>
                         <p className="mt-2 text-muted-foreground">We offer custom Enterprise plans for advisors and white-label solutions.</p>
                         <Button variant="link" asChild className="mt-2">
                             <Link href="mailto:support@flowbank.app">Contact Us</Link>
                         </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
