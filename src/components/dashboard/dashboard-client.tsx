
"use client";

import { useApp } from "@/contexts/app-provider";
import { AccountCard } from "./account-card";
import { IncomeForm } from "./income-form";
import { RecentAllocations } from "./recent-allocations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { formatCurrency } from "@/lib/utils";
import { PlaidTransactions } from "./plaid-transactions";
import { GettingStartedGuide } from "./getting-started-guide";
import { DollarSign, Banknote } from "lucide-react";
import type { Account, AllocationRule, Transaction, UserPlan } from "@/lib/types";

interface DashboardClientProps {
    initialData: {
        userPlan: UserPlan;
        rules: AllocationRule[];
        accounts: Account[];
        transactions: Transaction[];
    } | null;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { 
    accounts: contextAccounts, 
    transactions: contextTransactions,
    addIncome, 
    plaidAccessToken, 
    loadingData 
  } = useApp();

  // Use server-provided data initially, then switch to client-side context state
  const accounts = initialData && !loadingData ? initialData.accounts : contextAccounts;
  const transactions = initialData && !loadingData ? initialData.transactions : contextTransactions;
  
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Show a more detailed skeleton or a simplified view if initialData is not available
  if (loadingData && !initialData) {
    return <div>Loading dashboard...</div>
  }
  
  const isNewUser = transactions.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {isNewUser && <GettingStartedGuide />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Virtual Accounts</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {accounts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on your allocation rules
            </p>
          </CardContent>
        </Card>
        <IncomeForm onAddIncome={addIncome} />
      </div>
      
      {plaidAccessToken ? (
        <PlaidTransactions />
      ) : (
        !isNewUser && (
            <Card className="text-center p-8">
                <CardTitle>Connect Your Bank</CardTitle>
                <CardDescription className="mt-2">
                    Link your bank account in Settings to automatically find and allocate income.
                </CardDescription>
            </Card>
        )
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RecentAllocations />
        </div>
        <div className="lg:col-span-4">
            <h2 className="text-xl font-bold font-headline mb-4">Account Balances</h2>
            <div className="space-y-4">
              {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
