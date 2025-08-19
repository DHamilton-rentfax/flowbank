
"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createLinkToken } from "@/app/actions/create-link-token";
import { exchangePublicToken } from "@/app/actions/exchange-public-token";
import { usePlaidLink } from "react-plaid-link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
        try {
            await exchangePublicToken(public_token);
            toast({title: "Bank Account Linked!", description: "Your account is now connected and ready to sync."});
            next();
        } catch (e) {
            const error = e as Error;
            toast({title: "Linking Failed", description: error.message, variant: "destructive"});
        }
    },
  });

  const handleConnectBank = async () => {
      if (!user) {
        toast({ title: "Please sign in first", variant: "destructive" });
        return;
      }
      try {
        const { linkToken: fetchedToken, error } = await createLinkToken();
        if (error) throw new Error(error);
        
        if (fetchedToken) {
          setLinkToken(fetchedToken);
        } else {
            throw new Error("Could not fetch link token.")
        }
      } catch (e) {
        const error = e as Error;
        toast({ title: "Plaid Error", description: error.message, variant: "destructive"});
      }
  }

  React.useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const next = () => setStep(s => s + 1);

  const renderStep = () => {
      switch(step) {
          case 1:
              return (
                  <CardContent>
                      <p className="text-muted-foreground mb-4">First, connect the bank account where you receive income. This allows FlowBank to detect deposits and begin the allocation process.</p>
                      <Button onClick={handleConnectBank} disabled={!ready}>Connect Bank Account</Button>
                  </CardContent>
              );
          case 2:
              return (
                <CardContent>
                  <p className="text-muted-foreground mb-4">Great! Now, let's define how you want to split your income. Create rules to allocate percentages to different categories like taxes, savings, or owner's pay.</p>
                  <Button asChild>
                    <Link href="/rules">Create Allocation Rules</Link>
                  </Button>
                  <Button variant="ghost" onClick={next} className="ml-2">Skip for now</Button>
                </CardContent>
              )
          case 3:
              return (
                <CardContent>
                    <p className="text-muted-foreground mb-4">You're all set up! To fully automate your finances, choose a plan that fits your needs. Automation runs in the background, saving you time and effort.</p>
                    <Button asChild>
                        <Link href="/pricing">Choose a Plan</Link>
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/dashboard')} className="ml-2">Go to Dashboard</Button>
                </CardContent>
              )
      }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Welcome to FlowBank ({step}/3)</CardTitle>
                <CardDescription>Let's get your finances on autopilot in a few simple steps.</CardDescription>
            </CardHeader>
            {renderStep()}
        </Card>
      </main>
      <Footer />
    </div>
  );
}

    