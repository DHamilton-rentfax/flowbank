
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createAddOnCheckoutSession } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";
import { useApp } from "@/contexts/app-provider";
import { addOns } from "@/lib/plans";
import { Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {addOns.map((addOn) => {
        const isSubscribed = userPlan?.addOns?.[addOn.id] ?? false;
        
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
