
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Rocket, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createStripeConnectedAccount } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";
import { useApp } from "@/contexts/app-provider";

export function StripeConnect() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { userPlan } = useApp();
  const isConnected = !!userPlan?.stripeAccountId;

  const handleConnect = async () => {
    if (!user || !user.email) {
      toast({
        title: "Error",
        description: "You must be logged in and have an email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createStripeConnectedAccount(user.uid, user.email);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        setIsLoading(false); // Only set loading false on error
      }
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated Payouts</CardTitle>
        <CardDescription>
          {isConnected
            ? "Your Stripe account is connected. You can now enable automated payouts and accept payments."
            : "Enable automatic transfers to your bank accounts by connecting with Stripe."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleConnect} disabled={isLoading || isConnected}>
          {isLoading ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : isConnected ? (
            <CheckCircle2 className="mr-2" />
          ) : (
            <Rocket className="mr-2 h-4 w-4" />
          )}
          {isLoading
            ? "Redirecting..."
            : isConnected
            ? "Stripe Account Connected"
            : "Enable Automated Payouts"}
        </Button>
      </CardContent>
    </Card>
  );
}

    