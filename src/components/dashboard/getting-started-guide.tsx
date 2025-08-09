
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Landmark, Settings, DollarSign, X } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/contexts/app-provider";
import { cn } from "@/lib/utils";

export function GettingStartedGuide() {
    const [isVisible, setIsVisible] = useState(true);
    const { plaidAccessToken } = useApp();

    const steps = [
        {
            icon: <Landmark className="w-5 h-5" />,
            title: "Connect Your Bank",
            description: "Sync your bank account to automate income tracking.",
            isComplete: !!plaidAccessToken,
            href: "/dashboard/settings"
        },
        {
            icon: <Settings className="w-5 h-5" />,
            title: "Review Your Allocation Rules",
            description: "Customize how your income gets divided.",
            isComplete: false, // Could be enhanced later to check if rules were modified from default
            href: "/dashboard/settings?tab=allocations"
        },
        {
            icon: <DollarSign className="w-5 h-5" />,
            title: "Add Your First Income",
            description: "Manually add a deposit to see the magic happen.",
            isComplete: false,
            href: "#" // Stays on the same page
        },
    ];

    if (!isVisible) {
        return null;
    }

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Welcome to FlowBank!</CardTitle>
                    <CardDescription>Here are a few steps to get your finances flowing.</CardDescription>
                </div>
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsVisible(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {steps.map((step, index) => (
                         <Link href={step.href} key={index}>
                            <div className={cn(
                                "p-4 rounded-lg border bg-background h-full flex items-start gap-4 transition-all hover:border-primary/50 hover:bg-primary/5",
                                step.isComplete && "border-green-200 bg-green-50/50"
                            )}>
                                 <div className={cn(
                                    "p-2 rounded-full",
                                    step.isComplete ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
                                 )}>
                                    {step.isComplete ? <CheckCircle className="w-5 h-5" /> : step.icon}
                                </div>
                                <div>
                                    <h4 className="font-semibold">{step.title}</h4>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
