
"use client";

import { useState, useEffect } from "react";
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
  const [incomeTransactions, setIncomeTransactions] = useState<any[]>([]);
  const [allocatedTransactionIds, setAllocatedTransactionIds] = useState<string[]>([]);

  const isPaidUser = userPlan?.id !== 'free';

  const handleAllocate = (amount: number, id: string) => {
    // Plaid amounts for credits are negative, so we use Math.abs
    addIncome(Math.abs(amount));
    setAllocatedTransactionIds(prev => [...prev, id]);
    toast({
        title: "Success",
        description: `${formatCurrency(Math.abs(amount))} allocated successfully.`,
        className: "bg-accent text-accent-foreground",
    });
  }
  
  const handleFindIncome = async (transactionsToScan: any[]) => {
    if (transactionsToScan.length === 0) {
        toast({ title: "No New Transactions", description: "All synced transactions have already been analyzed."});
        return { count: 0, newIncome: [] };
    }

    setLoadingMessage("Analyzing...");
    const result = await findIncomeTransactions({ transactions: transactionsToScan });
    
    if (result.success && result.incomeTransactions) {
      const newIncome = result.incomeTransactions.filter(
          (newTx: any) => !incomeTransactions.some(prevTx => prevTx.transaction_id === newTx.transaction_id)
      );
      setIncomeTransactions(prev => [...prev, ...newIncome]);
      
      return { count: newIncome.length, newIncome };
    } else {
      toast({ title: "Error", description: result.error || "Could not identify income.", variant: "destructive" });
      return { count: 0, newIncome: [] };
    }
  };

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
      }
      
      if (result.nextCursor) {
        updatePlaidCursor(result.nextCursor);
      }
      
      const { count: incomeFoundCount, newIncome } = await handleFindIncome(newTransactions);
      
      let toastMessage = `${newTransactions.length} new transaction(s) synced.`;

      if (incomeFoundCount > 0) {
          if (isPaidUser) {
              toastMessage += ` Found and automatically allocated ${incomeFoundCount} income deposit(s).`;
              newIncome.forEach(tx => {
                  addIncome(Math.abs(tx.amount));
                  setAllocatedTransactionIds(prev => [...prev, tx.transaction_id]);
              });
          } else {
             toastMessage += ` Found ${incomeFoundCount} new income deposit(s) ready to allocate.`;
          }
      }

      toast({ 
        title: "Sync Complete!", 
        description: toastMessage
      });

    } else {
      toast({ title: "Error", description: result.error || "Could not sync transactions.", variant: "destructive" });
    }
    setIsLoading(false);
  };
  
  const isIncome = (transaction: any) => {
    return incomeTransactions.some(incomeTx => incomeTx.transaction_id === transaction.transaction_id);
  }
  
  const isAllocated = (transactionId: string) => {
    return allocatedTransactionIds.includes(transactionId);
  }
  
  // This effect will pre-populate incomeTransactions from the existing plaidTransactions on load
  useEffect(() => {
    const findInitialIncome = async () => {
        if (plaidTransactions.length > 0) {
            const result = await findIncomeTransactions({ transactions: plaidTransactions });
            if (result.success && result.incomeTransactions) {
                setIncomeTransactions(result.incomeTransactions);
            }
        }
    }
    findInitialIncome();
  }, []);


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
                                {isIncome(tx) && <Badge className="bg-green-100 text-green-800">Income</Badge>}
                            </TableCell>
                             <TableCell className="text-right">
                                {isIncome(tx) && !isPaidUser && (
                                    <Button size="sm" onClick={() => handleAllocate(tx.amount, tx.transaction_id)} disabled={isAllocated(tx.transaction_id)}>
                                        {isAllocated(tx.transaction_id) ? "Allocated" : "Allocate"}
                                    </Button>
                                )}
                                {isIncome(tx) && isPaidUser && (
                                    <Button size="sm" disabled={true}>
                                        Allocated
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
