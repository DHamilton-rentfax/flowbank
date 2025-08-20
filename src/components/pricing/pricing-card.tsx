
"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React from "react";
import { useToast } from "@/hooks/use-toast";

type Plan = {
    id: string;
    lookup_key: string | null;
    name: string;
    description: string | null;
    amount: number;
    features: string[];
    highlight?: boolean;
    customLabel?: string;
}

type PricingCardProps = {
    plan: Plan;
    interval: 'month' | 'year';
}

export default function PricingCard({ plan, interval }: PricingCardProps) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);

    const handleSubscribe = async () => {
        if (!user) {
            router.push(`/login?next=/pricing`);
            return;
        }
        if (!plan.lookup_key) {
            if (plan.name === 'Enterprise') {
                router.push('/contact');
            } else {
                 toast({ title: "Not Available", description: "This plan cannot be purchased directly.", variant: "destructive" });
            }
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
        <Card className={`flex flex-col justify-between shadow-xl p-6 ${plan.highlight ? 'border-2 border-primary' : ''}`}>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-muted-foreground">{plan.description}</p>
                <div className="text-3xl font-bold mt-4">
                    {plan.customLabel ? plan.customLabel : `$${plan.amount}`}
                    {plan.amount > 0 && !plan.customLabel && (
                        <span className="text-base font-normal text-muted-foreground">
                            /{interval === "month" ? "mo" : "yr"}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3 mt-4 flex-grow">
                {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                    </div>
                ))}
            </CardContent>
             <Button className="w-full mt-6" size="lg" onClick={handleSubscribe} disabled={loading} variant={plan.highlight ? 'default' : 'outline'}>
                {loading ? "Processing..." : plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
            </Button>
        </Card>
    );
}
