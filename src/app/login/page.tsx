import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Users, Banknote, ShieldCheck, Zap } from "lucide-react";

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
            <div className="grid grid-cols-2 gap-6">
                <div className="flex gap-3">
                    <Banknote className="size-8 text-primary shrink-0" />
                    <div>
                        <h3 className="font-semibold">Automated Payouts</h3>
                        <p className="text-sm text-muted-foreground">Set up automated transfers to your personal and business accounts with Stripe.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Zap className="size-8 text-primary shrink-0" />
                    <div>
                        <h3 className="font-semibold">AI-Powered Insights</h3>
                        <p className="text-sm text-muted-foreground">Get smart, AI-driven suggestions for your allocation rules based on your business type.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Users className="size-8 text-primary shrink-0" />
                    <div>
                        <h3 className="font-semibold">Unlimited Rules</h3>
                        <p className="text-sm text-muted-foreground">Create as many allocation buckets as you need to manage your money with precision.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <ShieldCheck className="size-8 text-primary shrink-0" />
                    <div>
                        <h3 className="font-semibold">Enhanced Security</h3>
                        <p className="text-sm text-muted-foreground">Enable Two-Factor Authentication (2FA) for an extra layer of account protection.</p>
                    </div>
                </div>
            </div>
             <p className="mt-8 text-xs text-muted-foreground">
                Start for free • No credit card required • Cancel anytime
            </p>
        </div>
      </div>
    </div>
  );
}
