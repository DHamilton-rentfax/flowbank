
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/app-provider";
import { getTransactions, findIncomeTransactions } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";

export function PlaidTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Syncing...");
  const { toast } = useToast();
  const { 
    plaidAccessToken, 
    plaidTransactions, 
    setPlaidTransactions, 
    addIncome,
    plaidCursor,
    updatePlaidCursor,
    userPlan,
  } = useApp();
  const [incomeTransactionIds, setIncomeTransactionIds] = useState<string[]>([]);
  const [allocatedTransactionIds, setAllocatedTransactionIds] = useState<string[]>([]);

  const isPaidUser = userPlan?.id !== 'free';

  const handleAllocate = useCallback((amount: number, id: string, isAuto: boolean = false) => {
    // Plaid amounts for credits are negative, so we use Math.abs
    addIncome(Math.abs(amount));
    setAllocatedTransactionIds(prev => [...prev, id]);
    if (!isAuto) {
        toast({
            title: "Success",
            description: `${formatCurrency(Math.abs(amount))} allocated successfully.`,
            className: "bg-accent text-accent-foreground",
        });
    }
  }, [addIncome, toast]);
  
  const analyzeAndSetIncome = useCallback(async (transactions: any[]) => {
      if (transactions.length === 0) return;
      const result = await findIncomeTransactions({ transactions });
      if (result.success && result.incomeTransactions) {
          const newIncomeIds = result.incomeTransactions.map((tx: any) => tx.transaction_id);
          setIncomeTransactionIds(prev => Array.from(new Set([...prev, ...newIncomeIds])));

          if (isPaidUser) {
              const newlyFoundIncome = result.incomeTransactions.filter((tx: any) => !allocatedTransactionIds.includes(tx.transaction_id));
              if (newlyFoundIncome.length > 0) {
                 newlyFoundIncome.forEach(tx => handleAllocate(tx.amount, tx.transaction_id, true));
                 toast({
                    title: "Income Allocated",
                    description: `Automatically allocated ${newlyFoundIncome.length} income deposit(s).`,
                    className: "bg-accent text-accent-foreground",
                 });
              }
          }
      }
  }, [isPaidUser, allocatedTransactionIds, handleAllocate, toast]);

  useEffect(() => {
      // Analyze transactions that are already loaded on initial mount
      if (plaidTransactions.length > 0) {
          analyzeAndSetIncome(plaidTransactions);
      }
  }, [plaidTransactions, analyzeAndSetIncome]);



  const handleSyncAndAnalyze = async () => {
    if (!plaidAccessToken) {
      toast({ title: "Error", description: "Plaid access token not found.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setLoadingMessage("Syncing...");

    const result = await getTransactions(plaidAccessToken, plaidCursor);

    if (result.success && result.added) {
      const newTransactions = result.added.filter(
        (newTx: any) => !plaidTransactions.some(existingTx => existingTx.transaction_id === newTx.transaction_id)
      );
      
      if (newTransactions.length > 0) {
        setPlaidTransactions(prev => [...newTransactions, ...prev]);
        setLoadingMessage("Analyzing...");
        await analyzeAndSetIncome(newTransactions);
      }
      
      if (result.nextCursor) {
        updatePlaidCursor(result.nextCursor);
      }
      
      toast({ 
        title: "Sync Complete!", 
        description: `${newTransactions.length} new transaction(s) synced.`
      });

    } else {
      toast({ title: "Error", description: result.error || "Could not sync transactions.", variant: "destructive" });
    }
    setIsLoading(false);
  };
  
  const isIncome = (transactionId: string) => {
    return incomeTransactionIds.includes(transactionId);
  }
  
  const isAllocated = (transactionId: string) => {
    return allocatedTransactionIds.includes(transactionId);
  }
  
  const transactionsToShow = [...plaidTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Transactions</CardTitle>
        <CardDescription>
          Sync your latest transactions and let AI find your income deposits.
          {isPaidUser && " Income will be allocated automatically."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactionsToShow.length > 0 ? (
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
                    {transactionsToShow.map((tx) => (
                        <TableRow key={tx.transaction_id}>
                            <TableCell>{tx.date}</TableCell>
                            <TableCell>{tx.merchant_name || tx.name}</TableCell>
                            <TableCell className={`text-right font-medium ${tx.amount < 0 ? 'text-green-600' : ''}`}>
                                {formatCurrency(Math.abs(tx.amount))}
                            </TableCell>
                            <TableCell className="text-center">
                                {isIncome(tx.transaction_id) && <Badge className="bg-green-100 text-green-800">Income</Badge>}
                            </TableCell>
                             <TableCell className="text-right">
                                {isIncome(tx.transaction_id) && !isPaidUser && (
                                    <Button size="sm" onClick={() => handleAllocate(tx.amount, tx.transaction_id)} disabled={isAllocated(tx.transaction_id)}>
                                        {isAllocated(tx.transaction_id) ? "Allocated" : "Allocate"}
                                    </Button>
                                )}
                                {isIncome(tx.transaction_id) && isPaidUser && (
                                    <Badge variant="secondary" className={isAllocated(tx.transaction_id) ? "bg-green-100 text-green-800" : ""}>
                                        {isAllocated(tx.transaction_id) ? "Allocated" : "Pending"}
                                    </Badge>
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
            <p>Click "Sync & Analyze" to get started.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button onClick={handleSyncAndAnalyze} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <RefreshCw className="mr-2"/>}
          {isLoading ? loadingMessage : "Sync & Analyze"}
        </Button>
      </CardFooter>
    </Card>
  );
}
