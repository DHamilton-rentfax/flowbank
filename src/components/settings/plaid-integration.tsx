
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bank, Loader2 } from "lucide-react";
import { usePlaidLink } from "react-plaid-link";
import { createLinkToken, exchangePublicToken } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export function PlaidIntegration() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getLinkToken = useCallback(async () => {
    const result = await createLinkToken();
    if (result.success && result.linkToken) {
      setLinkToken(result.linkToken);
    } else {
        toast({
            title: "Plaid Error",
            description: result.error || "Could not retrieve Plaid link token.",
            variant: "destructive",
        });
    }
  }, [toast]);

  useEffect(() => {
    getLinkToken();
  }, [getLinkToken]);

  const onSuccess = useCallback(async (public_token: string) => {
    setIsLoading(true);
    const result = await exchangePublicToken(public_token);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
        className: "bg-accent text-accent-foreground",
      });
    } else {
      toast({
        title: "Plaid Error",
        description: result.error || "Could not link bank account.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Integration</CardTitle>
        <CardDescription>
          Connect your bank account using Plaid to automatically sync your income.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
            className="w-full" 
            onClick={() => open()} 
            disabled={!ready || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <Bank className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Linking..." : "Connect Bank Account"}
        </Button>
      </CardContent>
    </Card>
  );
}
