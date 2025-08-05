
"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Users, Banknote, ShieldCheck, Zap } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const adFeatures = [
    {
        icon: Banknote,
        title: "Automated Payouts",
        description: "Set up automated transfers to your personal and business accounts with Stripe."
    },
    {
        icon: Zap,
        title: "AI-Powered Insights",
        description: "Get smart, AI-driven suggestions for your allocation rules based on your business type."
    },
    {
        icon: ShieldCheck,
        title: "Enhanced Security",
        description: "Enable Two-Factor Authentication (2FA) for an extra layer of account protection."
    },
    {
        icon: Users,
        title: "Unlimited Rules",
        description: "Create as many allocation buckets as you need to manage your money with precision."
    }
]

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
            <div className="mb-8 flex justify-center">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="size-8 text-primary" />
                    <h1 className="text-2xl font-semibold">FlowBank</h1>
                </Link>
            </div>
            <AuthForm mode="login" />
            <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
            </Link>
            </p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 flex-col items-start justify-center bg-muted p-12 text-foreground">
        <div className="max-w-md">
            <h2 className="text-3xl font-bold font-headline mb-4">
                Unlock Your Business's Full Potential
            </h2>
            <p className="text-muted-foreground mb-8">
                Go beyond basic allocation. Upgrade to a Pro plan to access powerful features designed to automate your finances and accelerate growth.
            </p>
            <Carousel 
                opts={{ loop: true }}
                plugins={[Autoplay({ delay: 5000 })]} 
                className="w-full"
            >
                <CarouselContent>
                    {adFeatures.map((feature, index) => (
                        <CarouselItem key={index}>
                            <div className="p-1">
                                <div className="flex gap-4 p-6 rounded-lg bg-background/50">
                                    <feature.icon className="size-8 text-primary shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
             <p className="mt-8 text-xs text-muted-foreground">
                Start for free • No credit card required • Cancel anytime
            </p>
        </div>
      </div>
    </div>
  );
}
