
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createCheckoutSession } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { plans } from "@/lib/plans";
import type { Plan } from "@/lib/types";

export default function PricingPage() {
    const { user, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handlePlanClick = async (planId: string) => {
        if (!user) {
            router.push(`/signup?plan=${planId}`);
            return;
        }
        
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        if (plan.price === 0) {
            router.push("/dashboard");
            return;
        }
        
        setSelectedPlan(planId);
        setIsLoading(true);
        const result = await createCheckoutSession(user.uid, planId);
        
        if (result.success && result.url) {
            window.location.href = result.url;
        } else {
            toast({
                title: "Error",
                description: result.error || "Could not start the checkout process.",
                variant: "destructive",
            });
            setIsLoading(false);
            setSelectedPlan(null);
        }
    }

    const getPlanDescription = (plan: Plan) => {
        switch (plan.id) {
            case 'free': return "For individuals getting started.";
            case 'starter': return "For solopreneurs and freelancers.";
            case 'pro': return "For growing businesses & power users.";
            case 'business': return "For established businesses and teams.";
            default: return "";
        }
    }

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
                <div className="container mx-auto max-w-7xl py-12 px-4">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">Find the perfect plan for your flow.</h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Start for free, then scale as you grow. No hidden fees.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {plans.map((plan) => (
                            <Card key={plan.id} className={`flex flex-col ${plan.id === 'pro' ? 'border-primary shadow-lg' : ''}`}>
                                <CardHeader>
                                    <CardTitle className="font-headline">{plan.name}</CardTitle>
                                     <div className="flex items-baseline gap-2">
                                        {plan.price > 0 ? (
                                            <>
                                                <span className="text-4xl font-bold font-headline">${plan.price}</span>
                                                <span className="text-muted-foreground">/ month</span>
                                            </>
                                        ) : (
                                            <span className="text-4xl font-bold font-headline">Free</span>
                                        )}
                                    </div>
                                    <CardDescription>{getPlanDescription(plan)}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <Check className="h-5 w-5 text-primary mr-2" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full" 
                                        variant={plan.id === 'pro' ? 'default' : 'outline'}
                                        onClick={() => handlePlanClick(plan.id)}
                                        disabled={isLoading || loading}
                                    >
                                        {isLoading && selectedPlan === plan.id ? <Loader2 className="animate-spin" /> : (plan.price === 0 ? 'Get Started' : 'Upgrade to ' + plan.name)}
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
