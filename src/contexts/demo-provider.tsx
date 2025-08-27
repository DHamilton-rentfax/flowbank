// src/contexts/demo-provider.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Account, AllocationRule, Transaction, UserPlan } from '@/lib/types';
import { produce } from 'immer';

// --- Sample Data for the Demo ---
const initialDemoData = {
    accounts: [
      { id: 'profit', name: 'Profit', balance: 1250.75 },
      { id: 'taxes', name: 'Taxes', balance: 3800.50 },
      { id: 'owners_pay', name: 'Owner’s Pay', balance: 7500.00 },
      { id: 'opex', name: 'Operating Expenses', balance: 15230.25 },
    ] as Account[],
    rules: [
        { id: 'rule1', name: 'Profit', percentage: 10, destination: { type: 'hold', id: 'profit' } },
        { id: 'rule2', name: 'Taxes', percentage: 25, destination: { type: 'hold', id: 'taxes' } },
        { id: 'rule3', name: 'Owner’s Pay', percentage: 35, destination: { type: 'hold', id: 'owners_pay' } },
        { id: 'rule4', name: 'Opex', percentage: 30, destination: { type: 'hold', id: 'opex' } },
    ] as AllocationRule[],
    transactions: [
      { id: 'tx1', date: '2024-07-28', name: 'Stripe Payout', amount: 8250.00, isIncome: true },
      { id: 'tx2', date: '2024-07-27', name: 'Vercel Inc.', amount: -20.00, isIncome: false },
      { id: 'tx3', date: '2024-07-27', name: 'Notion Labs', amount: -12.00, isIncome: false },
      { id: 'tx4', date: '2024-07-26', name: 'Google Ads', amount: -150.00, isIncome: false },
      { id: 'tx5', date: '2024-07-25', name: 'Shopify Payout', amount: 4300.00, isIncome: true },
    ] as Transaction[],
    userPlan: { id: 'pro', name: 'Pro' } as UserPlan,
    subscriptionStatus: 'active',
    features: { 'full-ai': true, 'analytics': true, 'team-seats': true },
};

// Define the shape of the context
interface DemoContextType {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  rules: AllocationRule[];
  setRules: React.Dispatch<React.SetStateAction<AllocationRule[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  userPlan: UserPlan | null;
  subscriptionStatus: string | null;
  features: { [key: string]: boolean };
  runAllocation: (txId: string) => void;
}

// Create the context with a default value
const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Define the provider component
interface DemoProviderProps {
  children: ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialDemoData.accounts);
  const [rules, setRules] = useState<AllocationRule[]>(initialDemoData.rules);
  const [transactions, setTransactions] = useState<Transaction[]>(initialDemoData.transactions);
  
  const userPlan = initialDemoData.userPlan;
  const subscriptionStatus = initialDemoData.subscriptionStatus;
  const features = initialDemoData.features;

  const runAllocation = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || !tx.isIncome) return;

    // Use Immer for safe and easy state updates
    const nextState = produce(accounts, draft => {
        rules.forEach(rule => {
            const allocationAmount = tx.amount * (rule.percentage / 100);
            const targetAccount = draft.find(acc => acc.id === rule.destination?.id);
            if (targetAccount) {
                targetAccount.balance += allocationAmount;
            }
        });
    });
    setAccounts(nextState);
  };

  const value = {
    accounts,
    setAccounts,
    rules,
    setRules,
    transactions,
    setTransactions,
    userPlan,
    subscriptionStatus,
    features,
    runAllocation,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

// Custom hook to use the context
export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
