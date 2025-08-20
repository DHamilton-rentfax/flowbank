
"use client";

import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React from "react";

interface Addon {
    id: string;
    lookup_key: string;
    name: string;
    description: string | null;
    amount: number;
}

interface AddonToggleProps {
    addon: Addon;
    interval: 'month' | 'year';
}

export default function AddonToggle({ addon, interval }: AddonToggleProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    const handleAddAddon = async () => {
        if (!user) {
            router.push(`/login?next=/pricing`);
            return;
        }

        setLoading(true);
        try {
            const { createCheckoutSession } = await import('@/app/actions/create-checkout-session');
            const { url, error } = await createCheckoutSession([{ lookup_key: addon.lookup_key }]);

            if (error) throw new Error(error);
            if (url) router.push(url);

        } catch (e) {
            const error = e as Error;
            toast({
                title: "Error",
                description: `Could not add addon: ${error.message}`,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-background">
            <div>
                <Label htmlFor={addon.id} className="font-semibold text-base">{addon.name}</Label>
                <p className="text-sm text-muted-foreground pr-4">{addon.description}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-bold text-lg">${addon.amount}</p>
                    <p className="text-xs text-muted-foreground">per {interval}</p>
                </div>
                <Button onClick={handleAddAddon} disabled={loading}>
                    {loading ? "Processing..." : "Add"}
                </Button>
            </div>
        </div>
    );
}
