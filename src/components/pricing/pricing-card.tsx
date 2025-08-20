
"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface Plan {
    id: string;
    lookup_key: string | null;
    name: string;
    description: string | null;
    amount: number;
    features: string[];
    highlight?: boolean;
    customLabel?: string;
}

interface PricingCardProps {
    plan: Plan;
    interval: 'month' | 'year';
}

export default function PricingCard({ plan, interval }: PricingCardProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    
    const handleSubscribe = async () => {
        if (!user) {
            router.push(`/login?next=/pricing`);
            return;
        }
        if (!plan.lookup_key) {
            router.push('/contact');
            return;
        }

        setLoading(true);
        try {
            const { createCheckoutSession } = await import('@/app/actions/create-checkout-session');
            const { url, error } = await createCheckoutSession([{ lookup_key: plan.lookup_key }]);

            if (error) {
                throw new Error(error);
            }
            if (url) {
                router.push(url);
            }
        } catch (e) {
            const error = e as Error;
            toast({
                title: "Checkout Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn(
            "border rounded-xl p-6 flex flex-col h-full bg-background",
            plan.highlight && "border-primary ring-2 ring-primary"
        )}>
            <div className="flex-grow">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-1 text-sm h-10">{plan.description}</p>
                <div className="mt-6">
                    <span className="text-4xl font-bold">${plan.amount}</span>
                    <span className="text-muted-foreground">/{interval === 'month' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{feature.trim()}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <Button 
                onClick={handleSubscribe} 
                className="w-full mt-8" 
                variant={plan.highlight ? 'default' : 'outline'}
                disabled={loading}
            >
                {loading ? 'Processing...' : (plan.customLabel || 'Get Started')}
            </Button>
        </div>
    );
}
