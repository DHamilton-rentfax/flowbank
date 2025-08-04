
"use client";

import { useApp } from "@/contexts/app-provider";
import { AccountCard } from "./account-card";
import { IncomeForm } from "./income-form";
import { RecentAllocations } from "./recent-allocations";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatCurrency } from "@/lib/utils";

export function DashboardClient() {
  const { accounts, addIncome, transactions } = useApp();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} accounts
            </p>
          </CardContent>
        </Card>
        <IncomeForm onAddIncome={addIncome} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RecentAllocations transactions={transactions} />
        </div>
        <div className="lg:col-span-4">
            <h2 className="text-xl font-semibold mb-4">Account Balances</h2>
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
