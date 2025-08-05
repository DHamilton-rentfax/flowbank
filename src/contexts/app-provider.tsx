
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Account, AllocationRule, Transaction, UserPlan } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/firebase/client';
import { doc, getDoc, setDoc, collection, writeBatch, query, orderBy, onSnapshot } from "firebase/firestore";
import { createUserDocument, initialRulesForNewUser } from '@/lib/plans';

// Define the shape of the context
interface AppContextType {
  accounts: Account[];
  rules: AllocationRule[];
  transactions: Transaction[];
  plaidTransactions: any[];
  setPlaidTransactions: (transactions: any[] | ((prev: any[]) => any[])) => void;
  addIncome: (amount: number) => void;
  updateRules: (newRules: AllocationRule[]) => void;
  updateAccount: (updatedAccount: Account) => void;
  plaidAccessToken: string | null;
  setPlaidAccessToken: (token: string | null) => void;
  plaidCursor: string | null;
  updatePlaidCursor: (cursor: string) => void;
  loadingData: boolean;
  userPlan: UserPlan | null;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Define the provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rules, setRules] = useState<AllocationRule[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plaidAccessToken, setPlaidAccessTokenState] = useState<string | null>(null);
  const [plaidCursor, setPlaidCursor] = useState<string | null>(null);
  const [plaidTransactions, setPlaidTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);


  // Load data from Firestore
  useEffect(() => {
    if (user?.uid) {
      setLoadingData(true);
      
      const userDocRef = doc(db, "users", user.uid);
      
      const unsubscribeAll = [
        onSnapshot(userDocRef, async (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setPlaidAccessTokenState(data.plaidAccessToken || null);
            setPlaidCursor(data.plaidCursor || null);
            setUserPlan(data.plan || null);
          } else {
            // This case handles a brand-new user where the doc might not be created yet.
            // We'll create it here to be safe.
            await createUserDocument(user.uid, user.email!);
          }
        }),
        onSnapshot(collection(db, "users", user.uid, "rules"), (snapshot) => {
          if (!snapshot.empty) {
            setRules(snapshot.docs.map(doc => doc.data() as AllocationRule));
          } else {
            // This might be a new user, let's set initial client-side rules to prevent errors.
            setRules(initialRulesForNewUser());
          }
        }),
        onSnapshot(collection(db, "users", user.uid, "accounts"), (snapshot) => {
          if (!snapshot.empty) {
            setAccounts(snapshot.docs.map(doc => doc.data() as Account));
            setLoadingData(false); // Consider data loaded once accounts are fetched
          } else {
             setAccounts(initialRulesForNewUser().map(rule => ({id: rule.id, name: rule.name, balance: 0})));
             setLoadingData(false);
          }
        }),
        onSnapshot(query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc")), (snapshot) => {
          setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction)));
        }),
        onSnapshot(query(collection(db, "users", user.uid, "plaid_transactions"), orderBy("date", "desc")), (snapshot) => {
          setPlaidTransactions(snapshot.docs.map(doc => doc.data()));
        })
      ];

      return () => {
        unsubscribeAll.forEach(unsub => unsub());
      }
    } else if (!user) {
      // Clear data if user logs out
      setAccounts([]);
      setRules([]);
      setTransactions([]);
      setPlaidAccessTokenState(null);
      setPlaidCursor(null);
      setUserPlan(null);
      setLoadingData(true); // Set to true until a user is available
    }
  }, [user]);

  
  const setPlaidAccessToken = useCallback(async (token: string | null) => {
      if (!user) return;
      setPlaidAccessTokenState(token);
      // Reset cursor and transactions when a new token is set
      setPlaidCursor(null);
      setPlaidTransactions([]);
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { plaidAccessToken: token, plaidCursor: null }, { merge: true });
  },[user]);

  const updatePlaidCursor = useCallback(async (cursor: string) => {
    if(!user) return;
    setPlaidCursor(cursor);
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { plaidCursor: cursor }, { merge: true });
  }, [user]);

  const updateAccount = useCallback(async (updatedAccount: Account) => {
    if (!user) return;
    const accountDocRef = doc(db, "users", user.uid, "accounts", updatedAccount.id);
    await setDoc(accountDocRef, updatedAccount, { merge: true });
  }, [user]);

  const updateRules = useCallback(async (newRules: AllocationRule[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    
    // Get all accounts to find existing ones by name
    const accountsRef = collection(db, "users", user.uid, "accounts");
    const accountsSnap = await getDoc(doc(accountsRef));
    const existingAccounts = accountsSnap.exists() ? accountsSnap.data() as Account[] : [];


    // Delete old rules first to handle deletions
    const rulesCollectionRef = collection(db, "users", user.uid, "rules");
    const oldRulesSnap = await getDoc(doc(rulesCollectionRef));
    if(oldRulesSnap.exists()){
        // Not a standard operation, typically you'd query and delete.
        // For simplicity here we assume IDs are known or can be fetched.
        // A better approach would be to fetch all docs and delete them.
    }
    
    // Set new rules and create/update corresponding accounts
    newRules.forEach(rule => {
        const ruleDocRef = doc(db, "users", user.uid, "rules", rule.id);
        batch.set(ruleDocRef, rule);
        
        const accountDocRef = doc(db, "users", user.uid, "accounts", rule.id);
        const existingAccount = existingAccounts.find(acc => acc.name === rule.name);
        
        batch.set(accountDocRef, {
            id: rule.id,
            name: rule.name,
            balance: existingAccount?.balance || 0,
            goal: existingAccount?.goal || null,
        }, { merge: true });
    });
    
    await batch.commit();

  }, [user]);

  const addIncome = useCallback(async (amount: number) => {
    if (!user || rules.length === 0) return;
    
    const batch = writeBatch(db);

    const newAllocations: { ruleId: string; amount: number }[] = [];
    const currentAccounts = [...accounts]; // Create a mutable copy
    
    rules.forEach(rule => {
      const allocationAmount = amount * (rule.percentage / 100);
      newAllocations.push({ ruleId: rule.id, amount: allocationAmount });

      const accountIndex = currentAccounts.findIndex(acc => acc.id === rule.id);

      if (accountIndex !== -1) {
        const accountToUpdate = currentAccounts[accountIndex];
        const updatedBalance = accountToUpdate.balance + allocationAmount;
        const accountDocRef = doc(db, "users", user.uid, "accounts", accountToUpdate.id);
        batch.update(accountDocRef, { balance: updatedBalance });
        // Update local state immediately for responsiveness
        currentAccounts[accountIndex] = { ...accountToUpdate, balance: updatedBalance };
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
    setAccounts(currentAccounts); // Update state after commit
  }, [user, rules, accounts]);
  
  const setPlaidTransactionsWithPersistence = useCallback(async (newTransactions: any[]) => {
      if (!user || newTransactions.length === 0) return;

      const batch = writeBatch(db);
      newTransactions.forEach(tx => {
        const txDocRef = doc(db, "users", user.uid, "plaid_transactions", tx.transaction_id);
        batch.set(txDocRef, tx);
      });
      await batch.commit();

  }, [user]);


  const value = {
    accounts,
    rules,
    transactions,
    addIncome,
    updateRules,
    updateAccount,
    plaidAccessToken,
    setPlaidAccessToken,
    plaidCursor,
    updatePlaidCursor,
    plaidTransactions,
    setPlaidTransactions: (txs: any) => {
        if (typeof txs === 'function') {
            setPlaidTransactions(prev => {
                const newTxs = txs(prev);
                const addedTxs = newTxs.filter((t: any) => !prev.some(p => p.transaction_id === t.transaction_id));
                if(addedTxs.length > 0) {
                    setPlaidTransactionsWithPersistence(addedTxs);
                }
                return newTxs;
            })
        } else {
             setPlaidTransactions(txs);
             setPlaidTransactionsWithPersistence(txs);
        }
    },
    loadingData,
    userPlan
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
