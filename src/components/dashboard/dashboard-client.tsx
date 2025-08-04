
"use client";

import { useApp } from "@/contexts/app-provider";
import { AccountCard } from "./account-card";
import { IncomeForm } from "./income-form";
import { RecentAllocations } from "./recent-allocations";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatCurrency } from "@/lib/utils";
import { PlaidTransactions } from "./plaid-transactions";
import { DollarSign, Banknote } from "lucide-react";

export function DashboardClient() {
  const { accounts, addIncome, plaidAccessToken, loadingData } = useApp();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // This prevents a flash of empty content while data is loading from Firestore
  if (loadingData) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6">
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
        <Card className="text-center p-8">
            <CardTitle>Connect Your Bank</CardTitle>
            <CardDescription className="mt-2">
                Link your bank account in Settings to automatically find and allocate income.
            </CardDescription>
        </Card>
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
