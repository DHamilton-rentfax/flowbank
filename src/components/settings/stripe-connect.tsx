
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createStripeConnectedAccount } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";

export function StripeConnect() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleConnect = async () => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    try {
        const result = await createStripeConnectedAccount(user.uid, user.email!);
        if (result.success && result.url) {
            window.location.href = result.url;
        } else {
             toast({ title: "Error", description: result.error, variant: "destructive"});
        }
    } catch(e) {
        toast({ title: "Error", description: (e as Error).message, variant: "destructive"});
    }
    // No need to set isLoading to false if we are redirecting
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated Payouts</CardTitle>
        <CardDescription>
          Enable automatic transfers to your bank accounts by connecting with Stripe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
            className="w-full" 
            onClick={handleConnect} 
            disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <Rocket className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Redirecting..." : "Enable Automated Payouts"}
        </Button>
      </CardContent>
    </Card>
  );
}
