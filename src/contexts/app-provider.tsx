"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState, useMemo } from "react";
import type { Account, AllocationRule, Transaction } from "@/lib/types";
import { nanoid } from "nanoid";

const initialRules: AllocationRule[] = [
  { id: "1", name: "Operating Expenses", percentage: 30 },
  { id: "2", name: "Taxes", percentage: 25 },
  { id: "3", name: "Owner Compensation", percentage: 20 },
  { id: "4", name: "Marketing", percentage: 15 },
  { id: "5", name: "Savings", percentage: 10 },
];

const initialAccounts: Account[] = [
  { id: "main", name: "Main Account", balance: 10000 },
  ...initialRules.map((rule) => ({
    id: rule.id,
    name: rule.name,
    balance: Math.floor(Math.random() * 5000),
  })),
];

interface AppContextType {
  accounts: Account[];
  rules: AllocationRule[];
  transactions: Transaction[];
  addIncome: (amount: number) => void;
  updateRules: (newRules: AllocationRule[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<AllocationRule[]>(initialRules);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addIncome = (amount: number) => {
    setAccounts((prevAccounts) => {
      const newAccounts = [...prevAccounts];
      const mainAccount = newAccounts.find((acc) => acc.id === "main");
      if (mainAccount) {
        mainAccount.balance += amount;
      }
      return newAccounts;
    });

    const newTransaction: Transaction = {
      id: nanoid(),
      date: new Date().toISOString(),
      totalAmount: amount,
      allocations: [],
    };

    setAccounts((prevAccounts) => {
      const newAccounts = JSON.parse(JSON.stringify(prevAccounts));
      
      rules.forEach((rule) => {
        const allocationAmount = (amount * rule.percentage) / 100;
        const targetAccount = newAccounts.find((acc: Account) => acc.id === rule.id);
        if (targetAccount) {
          targetAccount.balance += allocationAmount;
          newTransaction.allocations.push({
            ruleId: rule.id,
            amount: allocationAmount,
          });
        }
      });

      return newAccounts;
    });

    setTransactions((prev) => [newTransaction, ...prev]);
  };
  
  const updateRules = (newRules: AllocationRule[]) => {
    setRules(newRules);
    setAccounts(prevAccounts => {
        const mainAccount = prevAccounts.find(a => a.id === 'main');
        const existingRuleAccounts = prevAccounts.filter(a => a.id !== 'main');

        const updatedAccounts: Account[] = newRules.map(rule => {
            const existing = existingRuleAccounts.find(a => a.id === rule.id || a.name === rule.name);
            return {
                id: rule.id,
                name: rule.name,
                balance: existing ? existing.balance : 0,
            };
        });
        
        return mainAccount ? [mainAccount, ...updatedAccounts] : updatedAccounts;
    });
  };

  const contextValue = useMemo(
    () => ({
      accounts,
      rules,
      transactions,
      addIncome,
      updateRules,
    }),
    [accounts, rules, transactions]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
