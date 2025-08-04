
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
  const { 
    plaidAccessToken, 
    plaidTransactions, 
    setPlaidTransactions, 
    addIncome,
    plaidCursor,
    updatePlaidCursor,
  } = useApp();
  const [incomeTransactions, setIncomeTransactions] = useState<any[]>([]);
  const [allocatedTransactionIds, setAllocatedTransactionIds] = useState<string[]>([]);

  const handleSyncTransactions = async () => {
    if (!plaidAccessToken) {
      toast({ title: "Error", description: "Plaid access token not found.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const result = await getTransactions(plaidAccessToken, plaidCursor);
    setIsLoading(false);

    if (result.success && result.added) {
      // In a real app, you would also handle `modified` and `removed` transactions.
      setPlaidTransactions(prev => [...result.added!, ...prev]);
      if (result.nextCursor) {
        updatePlaidCursor(result.nextCursor);
      }
      toast({ title: "Success", description: `${result.added.length} new transaction(s) synced.` });
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
    // Only check un-identified transactions
    const transactionsToScan = plaidTransactions.filter(tx => !incomeTransactions.some(itx => itx.transaction_id === tx.transaction_id));
    
    if (transactionsToScan.length === 0) {
        setIsFindingIncome(false);
        toast({ title: "No New Transactions", description: "All synced transactions have already been analyzed."});
        return;
    }

    const result = await findIncomeTransactions({ transactions: transactionsToScan });
    setIsFindingIncome(false);

    if (result.success && result.incomeTransactions) {
      setIncomeTransactions(prev => [...prev, ...result.incomeTransactions!]);
      toast({ title: "Income Found", description: `Found ${result.incomeTransactions.length} new income transaction(s).` });
    } else {
      toast({ title: "Error", description: result.error || "Could not identify income.", variant: "destructive" });
    }
  };
  
  const handleAllocate = (amount: number, id: string) => {
    addIncome(Math.abs(amount));
    setAllocatedTransactionIds(prev => [...prev, id]);
    toast({
        title: "Success",
        description: "Income allocated successfully.",
    });
  }

  const isIncome = (transaction: any) => {
    return incomeTransactions.some(incomeTx => incomeTx.transaction_id === transaction.transaction_id);
  }
  
  const isAllocated = (transactionId: string) => {
    return allocatedTransactionIds.includes(transactionId);
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
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plaidTransactions.map((tx) => (
                        <TableRow key={tx.transaction_id}>
                            <TableCell>{tx.date}</TableCell>
                            <TableCell>{tx.merchant_name || tx.name}</TableCell>
                            <TableCell className={`text-right font-medium ${tx.amount < 0 ? 'text-accent' : ''}`}>
                                {formatCurrency(Math.abs(tx.amount))}
                            </TableCell>
                            <TableCell className="text-center">
                                {isIncome(tx) ? <Badge>Income</Badge> : tx.amount > 0 ? <Badge variant="outline">Expense</Badge> : null }
                            </TableCell>
                             <TableCell className="text-right">
                                {isIncome(tx) && (
                                    <Button size="sm" onClick={() => handleAllocate(tx.amount, tx.transaction_id)} disabled={isAllocated(tx.transaction_id)}>
                                        {isAllocated(tx.transaction_id) ? "Allocated" : "Allocate"}
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
