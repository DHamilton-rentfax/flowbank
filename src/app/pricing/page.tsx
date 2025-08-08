
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
        features: [
            { text: "Up to 2 allocation rules", included: true },
            { text: "Up to 3 virtual 'buckets' for your money", included: true },
            { text: "Manually allocate income deposits", included: true },
            { text: "View the last 30 days of transactions", included: true },
            { text: "Basic AI financial tips", included: true },
            { text: "Automated Stripe payouts", included: false },
            { text: "Advanced reporting & analytics", included: false },
            { text: "Team accounts", included: false },
            { text: "API Access", included: false },
        ],
        buttonText: "Get Started",
        highlight: false,
    },
    {
        id: "starter",
        name: "Starter",
        price: "$12",
        priceSuffix: "/ month",
        description: "For side-hustlers and freelancers getting serious.",
        features: [
            { text: "Up to 5 allocation rules", included: true },
            { text: "Up to 5 virtual 'buckets'", included: true },
            { text: "Automatically split income from Stripe", included: true },
            { text: "View the last 90 days of transactions", included: true },
            { text: "AI Coach with savings recommendations", included: true },
            { text: "Basic income and expense reporting", included: true },
            { text: "Team accounts", included: false },
            { text: "API Access", included: false },
        ],
        buttonText: "Choose Starter",
        highlight: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "$29",
        priceSuffix: "/ month",
        description: "The ultimate toolkit for solo entrepreneurs.",
        features: [
            { text: "Unlimited allocation rules", included: true },
            { text: "Unlimited virtual 'buckets'", included: true },
            { text: "Automatically split income from Stripe", included: true },
            { text: "View your full transaction history (1 year)", included: true },
            { text: "Full AI Coach: spending, savings, investment & tax advice", included: true },
            { text: "Advanced analytics and goal tracking", included: true },
            { text: "Team accounts", included: false },
            { text: "API Access", included: false },
        ],
        buttonText: "Choose Pro",
        highlight: true,
    },
    {
        id: "business",
        name: "Business",
        price: "$59",
        priceSuffix: "/ month",
        description: "For established businesses that need to scale.",
        features: [
            { text: "Unlimited allocation rules & buckets", included: true },
            { text: "Automated income splitting", included: true },
            { text: "Unlimited transaction history", included: true },
            { text: "Full AI Coach with custom business strategy analysis", included: true },
            { text: "Advanced analytics with CSV data export", included: true },
            { text: "Invite team members (multi-user support)", included: true },
            { text: "Full API access for custom integrations", included: true },
            { text: "Priority support queue", included: true },
        ],
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
                    {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                           {feature.included ? <CheckCircle2 className="mr-2 mt-1 h-5 w-5 text-accent shrink-0" /> : <XCircle className="mr-2 mt-1 h-5 w-5 text-muted-foreground shrink-0" />}
                           <span className="text-sm text-muted-foreground">{feature.text}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
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
