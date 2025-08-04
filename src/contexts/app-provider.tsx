
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Account, AllocationRule, Transaction } from '@/lib/types';
import { nanoid } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/firebase/client';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, writeBatch, query, orderBy, onSnapshot } from "firebase/firestore";

// Define the shape of the context
interface AppContextType {
  accounts: Account[];
  rules: AllocationRule[];
  transactions: Transaction[];
  plaidTransactions: any[];
  setPlaidTransactions: (transactions: any[]) => void;
  addIncome: (amount: number) => void;
  updateRules: (newRules: AllocationRule[]) => void;
  updateAccount: (updatedAccount: Account) => void;
  plaidAccessToken: string | null;
  setPlaidAccessToken: (token: string | null) => void;
  loadingData: boolean;
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
  const [loadingData, setLoadingData] = useState(true);

  // Load data from Firestore
  useEffect(() => {
    if (user?.uid) {
      setLoadingData(true);
      const userDocRef = doc(db, "users", user.uid);

      const fetchData = async () => {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
              setPlaidAccessTokenState(userDocSnap.data().plaidAccessToken || null);
          }
      };
      fetchData();

      const rulesUnsub = onSnapshot(collection(db, "users", user.uid, "rules"), async (snapshot) => {
          if (snapshot.empty) {
              // First time user, create initial rules and accounts
              const batch = writeBatch(db);
              const accountsData = initialRules.map(rule => ({
                  id: rule.id,
                  name: rule.name,
                  balance: 0,
              }));
              initialRules.forEach(rule => {
                  const ruleDocRef = doc(db, "users", user.uid, "rules", rule.id);
                  batch.set(ruleDocRef, rule);
              });
              accountsData.forEach(account => {
                  const accountDocRef = doc(db, "users", user.uid, "accounts", account.id);
                  batch.set(accountDocRef, account);
              });
              await batch.commit();
          } else {
              setRules(snapshot.docs.map(doc => doc.data() as AllocationRule));
          }
      });
      
      const accountsUnsub = onSnapshot(collection(db, "users", user.uid, "accounts"), (snapshot) => {
        setAccounts(snapshot.docs.map(doc => doc.data() as Account));
      });

      const transactionsQuery = query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc"));
      const transactionsUnsub = onSnapshot(transactionsQuery, (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({...doc.data(), id: doc.id } as Transaction)));
      });

      setLoadingData(false);

      return () => {
          rulesUnsub();
          accountsUnsub();
          transactionsUnsub();
      }
    } else {
      // Clear data if user logs out
      setAccounts([]);
      setRules([]);
      setTransactions([]);
      setPlaidAccessTokenState(null);
      setLoadingData(!user);
    }
  }, [user]);

  
  const setPlaidAccessToken = useCallback(async (token: string | null) => {
      if (!user) return;
      setPlaidAccessTokenState(token);
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { plaidAccessToken: token }, { merge: true });
  },[user]);

  const updateAccount = useCallback(async (updatedAccount: Account) => {
    if (!user) return;
    const accountDocRef = doc(db, "users", user.uid, "accounts", updatedAccount.id);
    await setDoc(accountDocRef, updatedAccount, { merge: true });
  }, [user]);

  const updateRules = useCallback(async (newRules: AllocationRule[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    const existingAccountsSnap = await getDocs(collection(db, "users", user.uid, "accounts"));
    const existingAccounts = existingAccountsSnap.docs.map(d => d.data() as Account);

    // Write new rules
    newRules.forEach(rule => {
        const ruleDocRef = doc(db, "users", user.uid, "rules", rule.id);
        batch.set(ruleDocRef, rule);
    });

    // Create corresponding accounts
     newRules.forEach(rule => {
        const existingAccount = existingAccounts.find(acc => acc.name.toLowerCase() === rule.name.toLowerCase());
        const accountDocRef = doc(db, "users", user.uid, "accounts", existingAccount?.id || rule.id);
        batch.set(accountDocRef, {
            id: existingAccount?.id || rule.id,
            name: rule.name,
            balance: existingAccount?.balance || 0,
            goal: existingAccount?.goal || null,
        }, { merge: true });
    });
    
    await batch.commit();

  }, [user]);

  const addIncome = useCallback(async (amount: number) => {
    if (!user || rules.length === 0 || accounts.length === 0) return;
    
    const batch = writeBatch(db);

    const newAllocations: { ruleId: string; amount: number }[] = [];
    
    rules.forEach(rule => {
      const allocationAmount = amount * (rule.percentage / 100);
      newAllocations.push({ ruleId: rule.id, amount: allocationAmount });

      // Find the account corresponding to the rule
      const accountToUpdate = accounts.find(acc => acc.name.toLowerCase() === rule.name.toLowerCase());

      if (accountToUpdate) {
        const accountDocRef = doc(db, "users", user.uid, "accounts", accountToUpdate.id);
        batch.update(accountDocRef, { balance: accountToUpdate.balance + allocationAmount });
      }
    });

    const newTransaction: Omit<Transaction, 'id'> = {
      date: new Date().toISOString(),
      totalAmount: amount,
      allocations: newAllocations,
    };

    const transactionCollectionRef = collection(db, "users", user.uid, "transactions");
    const newTransactionRef = doc(transactionCollectionRef);
    batch.set(newTransactionRef, newTransaction);
    
    await batch.commit();
  }, [user, rules, accounts]);

  const value = {
    accounts,
    rules,
    transactions,
    addIncome,
    updateRules,
    updateAccount,
    plaidAccessToken,
    setPlaidAccessToken,
    plaidTransactions,
    setPlaidTransactions,
    loadingData
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
