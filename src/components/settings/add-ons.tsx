
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createAddOnCheckoutSession, handleInstantPayout } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";
import { useApp } from "@/contexts/app-provider";
import { addOns } from "@/lib/plans";
import { Loader2, CheckCircle2, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AddOns() {
  const { user } = useAuth();
  const { userPlan } = useApp();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const handleSubscribe = async (addOnId: string) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to subscribe.", variant: "destructive"});
      return;
    }
    
    setIsLoading(addOnId);
    
    const result = await createAddOnCheckoutSession(user.uid, addOnId);
    
    if (result.success && result.url) {
        window.location.href = result.url;
    } else {
        toast({
            title: "Error",
            description: result.error || "Could not start the checkout process.",
            variant: "destructive",
        });
        setIsLoading(null);
    }
  }

  const onInstantPayout = async () => {
    if (!user) return;
    setIsLoading("per_use_payout");
    const result = await handleInstantPayout();

    if (result.success) {
        toast({
            title: result.upgraded ? "Successfully Upgraded!" : "Payout Successful!",
            description: result.message,
            className: "bg-accent text-accent-foreground",
        });
    } else {
        toast({
            title: "Payout Failed",
            description: result.error || "An unknown error occurred.",
            variant: "destructive"
        })
    }

    setIsLoading(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {addOns.map((addOn) => {
        const isSubscribed = userPlan?.addOns?.[addOn.id] ?? false;
        
        if (addOn.id === 'instant_payouts') {
            return (
                <Card key={addOn.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{addOn.name}</CardTitle>
                        <CardDescription>Get your money immediately. Choose the plan that works for you.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="p-4 rounded-lg border bg-background">
                            <h4 className="font-semibold">Unlimited Payouts</h4>
                            <p className="text-sm text-muted-foreground mb-2">Perfect for frequent transfers.</p>
                            <p className="text-2xl font-bold font-headline">
                                {formatCurrency(addOn.price)}
                                <span className="text-sm font-normal text-muted-foreground">/month</span>
                            </p>
                        </div>
                         <div className="p-4 rounded-lg border bg-background">
                            <h4 className="font-semibold">Pay Per Use</h4>
                            <p className="text-sm text-muted-foreground mb-2">Ideal for occasional instant needs.</p>
                            <p className="text-2xl font-bold font-headline">
                                $2.00
                                <span className="text-sm font-normal text-muted-foreground">/payout</span>
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                         <Button 
                            className="w-full" 
                            disabled={isLoading === addOn.id || isSubscribed}
                            onClick={() => handleSubscribe(addOn.id)}
                          >
                            {isLoading === addOn.id ? <Loader2 className="mr-2 animate-spin" /> : (isSubscribed ? <CheckCircle2 className="mr-2" /> : null) }
                            {isSubscribed ? "Subscribed to Unlimited" : "Subscribe to Unlimited"}
                          </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" variant="outline" disabled={isLoading === 'per_use_payout' || isSubscribed}>
                                    {isLoading === 'per_use_payout' && <Loader2 className="mr-2 animate-spin" />}
                                    <Zap className="mr-2" />
                                    Initiate Instant Payout ($2.00)
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Instant Payout</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You are about to make an instant payout for a one-time fee of $2.00. This amount will be charged to your primary payment method. Do you want to proceed?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onInstantPayout}>Confirm & Pay</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            )
        }

        return (
          <Card key={addOn.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{addOn.name}</CardTitle>
              <CardDescription>{addOn.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-2xl font-bold font-headline">
                    {formatCurrency(addOn.price)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={isLoading === addOn.id || isSubscribed}
                onClick={() => handleSubscribe(addOn.id)}
              >
                {isLoading === addOn.id && <Loader2 className="mr-2 animate-spin" />}
                {isSubscribed ? (
                    <>
                        <CheckCircle2 className="mr-2" />
                        Subscribed
                    </>
                ) : (
                    "Subscribe"
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  );
}
