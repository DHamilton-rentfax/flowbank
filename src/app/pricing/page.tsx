
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCheckoutSession } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const pricingTiers = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        priceSuffix: "",
        description: "For individuals testing the waters of smart finance.",
        features: {
            "Income Allocation Rules": "2 rules",
            "Allocation Buckets": "3 buckets",
            "Automated Stripe Payouts": false,
            "Transaction History": "30 days",
            "AI Financial Coach": "Basic tips only",
            "Reporting & Analytics": false,
            "Team Accounts": false,
            "API Access": false,
        },
        buttonText: "Get Started",
        highlight: false,
    },
    {
        id: "starter",
        name: "Starter",
        price: "$12",
        priceSuffix: "/ month",
        description: "For side-hustlers and freelancers getting serious.",
        features: {
            "Income Allocation Rules": "5 rules",
            "Allocation Buckets": "5 buckets",
            "Automated Stripe Payouts": true,
            "Transaction History": "90 days",
            "AI Financial Coach": "Basic + savings suggestions",
            "Reporting & Analytics": "Basic income/expense charts",
            "Team Accounts": false,
            "API Access": false,
        },
        buttonText: "Choose Starter",
        highlight: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "$29",
        priceSuffix: "/ month",
        description: "The ultimate toolkit for solo entrepreneurs.",
        features: {
            "Income Allocation Rules": "Unlimited rules",
            "Allocation Buckets": "Unlimited",
            "Automated Stripe Payouts": true,
            "Transaction History": "1 year",
            "AI Financial Coach": "Full AI coaching",
            "Reporting & Analytics": "Advanced analytics",
            "Team Accounts": false,
            "API Access": false,
        },
        buttonText: "Choose Pro",
        highlight: true,
    },
    {
        id: "business",
        name: "Business",
        price: "$59",
        priceSuffix: "/ month",
        description: "For established businesses that need to scale.",
        features: {
            "Income Allocation Rules": "Unlimited rules",
            "Allocation Buckets": "Unlimited",
            "Automated Stripe Payouts": true,
            "Transaction History": "Unlimited",
            "AI Financial Coach": "Full AI + custom strategy",
            "Reporting & Analytics": "Advanced + export",
            "Team Accounts": true,
            "API Access": true,
        },
        buttonText: "Contact Sales",
        highlight: false,
    }
];

function PricingCard({ tier }: { tier: typeof pricingTiers[0]}) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleButtonClick = async () => {
        if (!user) {
            router.push(`/signup?plan=${tier.id}`);
            return;
        }

        if (tier.id === 'free') {
            router.push('/dashboard');
            return;
        }
        
        if (tier.id === 'business') {
            // In a real app, this would open a contact form or a different flow
            router.push('mailto:sales@flowbank.ai');
            return;
        }

        setIsLoading(true);
        const result = await createCheckoutSession(user.uid, tier.id);
        
        if (result.success && result.url) {
            window.location.href = result.url;
        } else {
            toast({
                title: "Error",
                description: result.error || "Could not start the checkout process.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    }

    return (
        <Card className={cn("flex flex-col", tier.highlight && "border-primary ring-2 ring-primary")}>
            <CardHeader className={cn(tier.highlight && "bg-primary/5")}>
                 <CardTitle>{tier.name}</CardTitle>
                 <CardDescription>{tier.description}</CardDescription>
                 <div className="flex items-baseline pt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.priceSuffix && <span className="text-muted-foreground">{tier.priceSuffix}</span>}
                 </div>
            </CardHeader>
            <CardContent className="flex-1 py-6 space-y-4">
                 <ul className="space-y-3">
                    {Object.entries(tier.features).map(([feature, value]) => (
                        <li key={feature} className="flex items-start">
                           {typeof value === 'boolean' ? (
                             value ? <CheckCircle2 className="mr-2 mt-1 h-5 w-5 text-accent" /> : <XCircle className="mr-2 mt-1 h-5 w-5 text-muted-foreground" />
                           ) : (
                             <CheckCircle2 className="mr-2 mt-1 h-5 w-5 text-accent" />
                           )}
                           <span className="flex-1 text-sm">
                             <span className="font-medium">{feature}:</span>
                             <span className="text-muted-foreground ml-1">{typeof value === 'boolean' ? '' : value}</span>
                           </span>
                        </li>
                    ))}
                 </ul>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleButtonClick} className="w-full" variant={tier.highlight ? 'default' : 'outline'} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    {tier.buttonText}
                 </Button>
            </CardFooter>
        </Card>
    )
}

export default function PricingPage() {
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
         <div className="container mx-auto max-w-6xl py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Find the Plan That's Right for You</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Simple, transparent pricing. No hidden fees.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((tier) => (
                    <PricingCard key={tier.id} tier={tier} />
                ))}
            </div>
         </div>
       </main>
       <Footer />
    </div>
  );
}
