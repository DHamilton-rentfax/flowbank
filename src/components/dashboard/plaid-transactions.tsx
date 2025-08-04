
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/app-provider";
import { getTransactions, findIncomeTransactions } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Wand2 } from "lucide-react";

export function PlaidTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingIncome, setIsFindingIncome] = useState(false);
  const { toast } = useToast();
  const { plaidAccessToken, plaidTransactions, setPlaidTransactions, addIncome } = useApp();
  const [incomeTransactions, setIncomeTransactions] = useState<any[]>([]);

  const handleSyncTransactions = async () => {
    if (!plaidAccessToken) {
      toast({ title: "Error", description: "Plaid access token not found.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const result = await getTransactions(plaidAccessToken);
    setIsLoading(false);

    if (result.success && result.transactions) {
      setPlaidTransactions(result.transactions);
      toast({ title: "Success", description: "Transactions synced successfully." });
    } else {
      toast({ title: "Error", description: result.error || "Could not sync transactions.", variant: "destructive" });
    }
  };

  const handleFindIncome = async () => {
    if (plaidTransactions.length === 0) {
      toast({ title: "No Transactions", description: "Sync transactions before trying to find income.", variant: "destructive" });
      return;
    }
    setIsFindingIncome(true);
    const result = await findIncomeTransactions({ transactions: plaidTransactions });
    setIsFindingIncome(false);

    if (result.success && result.incomeTransactions) {
      setIncomeTransactions(result.incomeTransactions);
      toast({ title: "Income Found", description: `Found ${result.incomeTransactions.length} income transaction(s).` });
    } else {
      toast({ title: "Error", description: result.error || "Could not identify income.", variant: "destructive" });
    }
  };
  
  const handleAllocate = (amount: number, id: string) => {
    // A more robust implementation would prevent re-allocating the same transaction
    addIncome(Math.abs(amount));
    toast({
        title: "Success",
        description: "Income allocated successfully.",
    });
  }

  const isIncome = (transaction: any) => {
    return incomeTransactions.some(incomeTx => incomeTx.transaction_id === transaction.transaction_id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Transactions</CardTitle>
        <CardDescription>
          Sync your latest transactions and let AI find your income deposits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plaidTransactions.length > 0 ? (
          <div className="max-h-96 overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Income?</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plaidTransactions.map((tx) => (
                        <TableRow key={tx.transaction_id}>
                            <TableCell>{tx.date}</TableCell>
                            <TableCell>{tx.name}</TableCell>
                            <TableCell className={`text-right ${tx.amount < 0 ? 'text-accent' : ''}`}>
                                {formatCurrency(tx.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                                {isIncome(tx) && <Badge>Income</Badge>}
                            </TableCell>
                             <TableCell className="text-right">
                                {isIncome(tx) && (
                                    <Button size="sm" onClick={() => handleAllocate(tx.amount, tx.transaction_id)}>
                                        Allocate
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions synced yet.</p>
            <p>Click "Sync Transactions" to get started.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button onClick={handleSyncTransactions} disabled={isLoading || isFindingIncome}>
          {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
          {isLoading ? "Syncing..." : "Sync Transactions"}
        </Button>
        <Button onClick={handleFindIncome} disabled={isLoading || isFindingIncome || plaidTransactions.length === 0}>
          {isFindingIncome ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2"/>}
          {isFindingIncome ? "Analyzing..." : "Find Income"}
        </Button>
      </CardFooter>
    </Card>
  );
}
