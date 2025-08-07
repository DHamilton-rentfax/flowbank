
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Loader2 } from "lucide-react";
import { usePlaidLink } from "react-plaid-link";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/app-provider";

export function PlaidIntegration() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { plaidAccessToken, linkPlaidAccount, exchangePlaidPublicToken } = useApp();

  const getLinkToken = useCallback(async () => {
    setIsLoading(true);
    const token = await linkPlaidAccount();
    if (token) {
      setLinkToken(token);
    } else {
        toast({
            title: "Plaid Error",
            description: "Could not retrieve Plaid link token.",
            variant: "destructive",
        });
    }
    setIsLoading(false);
  }, [linkPlaidAccount, toast]);

  useEffect(() => {
    if (!plaidAccessToken) {
        getLinkToken();
    }
  }, [getLinkToken, plaidAccessToken]);

  const onSuccess = useCallback(async (public_token: string) => {
    setIsLoading(true);
    const success = await exchangePlaidPublicToken(public_token);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Success!",
        description: "Bank account linked successfully!",
        className: "bg-accent text-accent-foreground",
      });
    } else {
      toast({
        title: "Plaid Error",
        description: "Could not link bank account.",
        variant: "destructive",
      });
    }
  }, [toast, exchangePlaidPublicToken]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Integration</CardTitle>
        <CardDescription>
          {plaidAccessToken
            ? "Your bank account is connected."
            : "Connect your bank account using Plaid to automatically sync your income."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
            className="w-full" 
            onClick={() => open()} 
            disabled={!ready || isLoading || !!plaidAccessToken}
        >
          {isLoading ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <Landmark className="mr-2 h-4 w-4" />
          )}
          {plaidAccessToken ? "Account Connected" : isLoading ? "Linking..." : "Connect Bank Account"}
        </Button>
      </CardContent>
    </Card>
  );
}
