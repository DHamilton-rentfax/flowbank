
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bank } from "lucide-react";

export function PlaidIntegration() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Integration</CardTitle>
        <CardDescription>
          Connect your bank account using Plaid to automatically sync your income.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">
          <Bank className="mr-2 h-4 w-4" />
          Connect Bank Account
        </Button>
      </CardContent>
    </Card>
  );
}
