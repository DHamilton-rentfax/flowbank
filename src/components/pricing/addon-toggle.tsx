
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";

interface Price {
    interval: 'month' | 'year';
    lookup_key: string;
    amount: number;
}

interface Addon {
    id: string;
    name: string;
    description: string;
    prices: Price[];
}

interface AddonToggleProps {
    addon: Addon;
    interval: 'month' | 'year';
}

export default function AddonToggle({ addon, interval }: AddonToggleProps) {
    const price = addon.prices.find(p => p.interval === interval) || addon.prices[0];

    return (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-background">
            <div>
                <Label htmlFor={addon.id} className="font-semibold text-base">{addon.name}</Label>
                <p className="text-sm text-muted-foreground pr-4">{addon.description}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-bold text-lg">${price.amount / 100}</p>
                    <p className="text-xs text-muted-foreground">per {interval}</p>
                </div>
                <Button>Add</Button>
            </div>
        </div>
    );
}
