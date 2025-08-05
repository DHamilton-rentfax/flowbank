
"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Users, Banknote, ShieldCheck, Zap } from "lucide-react";


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

export default function SignupPage() {
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
          <AuthForm mode="signup" />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 flex-col items-start justify-center bg-sidebar p-12 text-sidebar-foreground">
        <div className="max-w-md">
            <h2 className="text-3xl font-bold font-headline mb-4">
                An All-in-One Platform to Grow Your Business
            </h2>
            <p className="text-muted-foreground mb-8">
                Create a free account to start managing your cash flow with the power of automation. See how FlowBank can help you achieve financial clarity.
            </p>
            <div className="space-y-4">
                {adFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-background/5">
                        <feature.icon className="size-8 text-primary shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
             <p className="mt-8 text-xs text-muted-foreground">
                Start for free • No credit card required • Cancel anytime
            </p>
        </div>
      </div>
    </div>
  );
}
