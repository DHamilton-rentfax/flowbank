
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Account, AllocationRule, Transaction, UserPlan, PaymentLink, UserData } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/firebase/client';
import { doc, getDoc, setDoc, collection, writeBatch, query, orderBy, onSnapshot, getDocs, deleteDoc } from "firebase/firestore";
import { initialRulesForNewUser } from '@/lib/plans';
import { createLinkToken, exchangePublicToken } from '@/app/actions';

// Define the shape of the context
interface AppContextType {
  accounts: Account[];
  rules: AllocationRule[];
  transactions: Transaction[];
  paymentLinks: PaymentLink[];
  plaidTransactions: any[];
  setPlaidTransactions: (transactions: any[] | ((prev: any[]) => any[])) => void;
  addIncome: (amount: number) => void;
  updateRules: (newRules: AllocationRule[]) => void;
  updateAccount: (updatedAccount: Account) => void;
  plaidAccessToken: string | null;
  linkPlaidAccount: () => Promise<string | null>;
  exchangePlaidPublicToken: (publicToken: string) => Promise<boolean>;
  plaidCursor: string | null;
  updatePlaidCursor: (cursor: string) => void;
  loadingData: boolean;
  userPlan: UserPlan | null;
  allUsers: UserData[];
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
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [plaidAccessToken, setPlaidAccessTokenState] = useState<string | null>(null);
  const [plaidCursor, setPlaidCursor] = useState<string | null>(null);
  const [plaidTransactions, setPlaidTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);


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

            if (data.plan?.role === 'admin') {
                // If user is admin, subscribe to all users collection
                const usersCollectionRef = collection(db, "users");
                const unsubscribeUsers = onSnapshot(usersCollectionRef, (snapshot) => {
                    const usersList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData));
                    setAllUsers(usersList);
                });
                return () => unsubscribeUsers();
            }

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
          } else {
             // If accounts don't exist, create them client-side from default rules
             setAccounts(initialRulesForNewUser().map(rule => ({id: rule.id, name: rule.name, balance: 0})));
          }
          setLoadingData(false); // Consider data loaded once accounts are checked/set
        }),
        onSnapshot(query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc")), (snapshot) => {
          setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction)));
        }),
        onSnapshot(query(collection(db, "users", user.uid, "plaid_transactions"), orderBy("date", "desc")), (snapshot) => {
          setPlaidTransactions(snapshot.docs.map(doc => doc.data()));
        }),
        onSnapshot(query(collection(db, "users", user.uid, "payment_links"), orderBy("createdAt", "desc")), (snapshot) => {
          setPaymentLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentLink)));
        }),
      ];

      return () => {
        unsubscribeAll.forEach(unsub => unsub && unsub());
      }
    } else if (!user) {
      // Clear data if user logs out
      setAccounts([]);
      setRules([]);
      setTransactions([]);
      setPaymentLinks([]);
      setPlaidAccessTokenState(null);
      setPlaidCursor(null);
      setUserPlan(null);
      setAllUsers([]);
      setLoadingData(true); // Set to true until a user is available
    }
  }, [user]);

  
  const linkPlaidAccount = useCallback(async () => {
      if (!user) return null;
      const result = await createLinkToken(user.uid);
      if (result.success && result.linkToken) {
          return result.linkToken;
      }
      return null;
  }, [user]);

  const exchangePlaidPublicToken = useCallback(async (publicToken: string) => {
      if(!user) return false;
      const result = await exchangePublicToken(publicToken, user.uid);
      if(result.success) {
          setPlaidAccessTokenState('linked'); // Use a non-null placeholder to update UI state
          return true;
      }
      return false;
  }, [user])

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
    const accountsSnap = await getDocs(accountsRef);
    const existingAccounts = accountsSnap.docs.map(d => d.data() as Account);

    // Get all current rules from state to find which to delete
    const rulesCollectionRef = collection(db, "users", user.uid, "rules");
    const oldRulesSnap = await getDocs(rulesCollectionRef);
    
    oldRulesSnap.docs.forEach(doc => {
        if (!newRules.some(r => r.id === doc.id)) {
            batch.delete(doc.ref);
            // Also delete corresponding account
            const accountDocRef = doc(db, "users", user.uid, "accounts", doc.id);
            batch.delete(accountDocRef);
        }
    });

    // Set new rules and create/update corresponding accounts
    newRules.forEach(rule => {
        const ruleDocRef = doc(db, "users", user.uid, "rules", rule.id);
        batch.set(ruleDocRef, rule);
        
        const accountDocRef = doc(db, "users", user.uid, "accounts", rule.id);
        const existingAccount = existingAccounts.find(acc => acc.name === rule.name && acc.id !== rule.id); // check for same name but different id
        const currentAccount = existingAccounts.find(acc => acc.id === rule.id);
        
        batch.set(accountDocRef, {
            id: rule.id,
            name: rule.name,
            balance: currentAccount?.balance || existingAccount?.balance || 0,
            goal: currentAccount?.goal || existingAccount?.goal || null,
        }, { merge: true });
    });
    
    await batch.commit();

  }, [user]);

  const addIncome = useCallback(async (amount: number) => {
    if (!user || rules.length === 0) return;
    
    const batch = writeBatch(db);

    const newAllocations: { ruleId: string; amount: number }[] = [];
    
    rules.forEach(rule => {
      const allocationAmount = amount * (rule.percentage / 100);
      newAllocations.push({ ruleId: rule.id, amount: allocationAmount });

      const accountIndex = accounts.findIndex(acc => acc.id === rule.id);

      if (accountIndex !== -1) {
        const accountToUpdate = accounts[accountIndex];
        const updatedBalance = accountToUpdate.balance + allocationAmount;
        const accountDocRef = doc(db, "users", user.uid, "accounts", accountToUpdate.id);
        batch.update(accountDocRef, { balance: updatedBalance });
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
    paymentLinks,
    addIncome,
    updateRules,
    updateAccount,
    plaidAccessToken,
    linkPlaidAccount,
    exchangePlaidPublicToken,
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
    userPlan,
    allUsers,
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

    