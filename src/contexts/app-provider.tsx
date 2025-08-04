
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Account, AllocationRule, Transaction } from '@/lib/types';
import { nanoid } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// Define the shape of the context
interface AppContextType {
  accounts: Account[];
  rules: AllocationRule[];
  transactions: Transaction[];
  plaidTransactions: any[];
  setPlaidTransactions: (transactions: any[]) => void;
  addIncome: (amount: number) => void;
  updateRules: (newRules: AllocationRule[]) => void;
  plaidAccessToken: string | null;
  setPlaidAccessToken: (token: string | null) => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Define the provider component
interface AppProviderProps {
  children: ReactNode;
}

const initialRules: AllocationRule[] = [
    { id: '1', name: 'Operating Expenses', percentage: 50 },
    { id: '2', name: 'Taxes', percentage: 20 },
    { id: '3', name: 'Owner Compensation', percentage: 15 },
    { id: '4', name: 'Savings', percentage: 10 },
    { id: '5', name: 'Marketing', percentage: 5 },
];


export function AppProvider({ children }: AppProviderProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rules, setRules] = useState<AllocationRule[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plaidAccessToken, setPlaidAccessTokenState] = useState<string | null>(null);
  const [plaidTransactions, setPlaidTransactions] = useState<any[]>([]);

  // Load data from localStorage when the component mounts
  useEffect(() => {
    if (user?.uid) {
        const storedAccounts = localStorage.getItem(`auto_allocator_accounts_${user.uid}`);
        const storedRules = localStorage.getItem(`auto_allocator_rules_${user.uid}`);
        const storedTransactions = localStorage.getItem(`auto_allocator_transactions_${user.uid}`);
        const storedPlaidToken = localStorage.getItem(`auto_allocator_plaid_token_${user.uid}`);
        
        if (storedRules) {
            setRules(JSON.parse(storedRules));
        } else {
            setRules(initialRules);
        }

        if (storedAccounts) {
            setAccounts(JSON.parse(storedAccounts));
        } else {
            // Create accounts from rules if none exist
            const newAccounts = initialRules.map(rule => ({
                id: rule.id,
                name: rule.name,
                balance: 0,
            }));
            setAccounts(newAccounts);
        }
        
        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions));
        }
        
        if(storedPlaidToken) {
            setPlaidAccessTokenState(storedPlaidToken);
        }
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user?.uid) {
        localStorage.setItem(`auto_allocator_accounts_${user.uid}`, JSON.stringify(accounts));
        localStorage.setItem(`auto_allocator_rules_${user.uid}`, JSON.stringify(rules));
        localStorage.setItem(`auto_allocator_transactions_${user.uid}`, JSON.stringify(transactions));
        if (plaidAccessToken) {
            localStorage.setItem(`auto_allocator_plaid_token_${user.uid}`, plaidAccessToken);
        } else {
            localStorage.removeItem(`auto_allocator_plaid_token_${user.uid}`);
        }
    }
  }, [accounts, rules, transactions, user, plaidAccessToken]);
  
  const setPlaidAccessToken = (token: string | null) => {
    setPlaidAccessTokenState(token);
  }

  const updateRules = (newRules: AllocationRule[]) => {
    setRules(newRules);
    // Update accounts based on new rules, keeping balances of existing accounts
    const updatedAccounts = newRules.map(rule => {
        const existingAccount = accounts.find(acc => acc.name.toLowerCase() === rule.name.toLowerCase());
        return {
            id: existingAccount?.id || rule.id,
            name: rule.name,
            balance: existingAccount?.balance || 0,
        };
    });
    setAccounts(updatedAccounts);
  };

  const addIncome = (amount: number) => {
    const newAllocations: { ruleId: string; amount: number }[] = [];
    let updatedAccounts = [...accounts];

    rules.forEach(rule => {
      const allocationAmount = amount * (rule.percentage / 100);
      newAllocations.push({ ruleId: rule.id, amount: allocationAmount });

      // Find the account corresponding to the rule
      const accountIndex = updatedAccounts.findIndex(acc => acc.name.toLowerCase() === rule.name.toLowerCase());
      if (accountIndex !== -1) {
        updatedAccounts[accountIndex] = {
          ...updatedAccounts[accountIndex],
          balance: updatedAccounts[accountIndex].balance + allocationAmount,
        };
      } else {
        // This case should ideally not happen if accounts are synced with rules
        console.warn(`No account found for rule: ${rule.name}`);
      }
    });

    const newTransaction: Transaction = {
      id: nanoid(),
      date: new Date().toISOString(),
      totalAmount: amount,
      allocations: newAllocations,
    };

    setAccounts(updatedAccounts);
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const value = {
    accounts,
    rules,
    transactions,
    addIncome,
    updateRules,
    plaidAccessToken,
    setPlaidAccessToken,
    plaidTransactions,
    setPlaidTransactions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
