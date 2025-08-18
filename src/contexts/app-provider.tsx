
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Account, AllocationRule, Transaction, UserPlan, PaymentLink, UserData } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/firebase/client';
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { AnalyzeTransactionsOutput } from '@/ai/flows/analyze-transactions';

// Define the shape of the context
interface AppContextType {
  accounts: Account[];
  rules: AllocationRule[];
  transactions: Transaction[];
  userPlan: UserPlan | null;
  subscriptionStatus: string | null;
  features: { [key: string]: boolean };
  analyticsSnapshot: any;
  setAnalyticsSnapshot: (snap: any) => void;
  aiSuggestion: any;
  setAiSuggestion: (suggestion: any) => void;
  aiFinancialAnalysis: (AnalyzeTransactionsOutput & { analyzedAt?: string }) | null;
  loadingData: boolean;
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
  const [loadingData, setLoadingData] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [features, setFeatures] = useState<{ [key: string]: boolean }>({});
  const [analyticsSnapshot, setAnalyticsSnapshot] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiFinancialAnalysis, setAiFinancialAnalysis] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      setLoadingData(true);
      
      const unsubscribes = [
        onSnapshot(doc(db, "users", user.uid), (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserPlan(data.plan || { id: 'free', name: 'Free' });
            setSubscriptionStatus(data.subscriptionStatus || null);
            setFeatures(data.features || {});
          }
        }),
        onSnapshot(collection(db, "users", user.uid, "rules"), (snapshot) => {
          setRules(snapshot.docs.map(doc => doc.data() as AllocationRule));
        }),
        onSnapshot(collection(db, "users", user.uid, "accounts"), (snapshot) => {
          setAccounts(snapshot.docs.map(doc => doc.data() as Account));
        }),
        onSnapshot(query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc")), (snapshot) => {
          setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction)));
          setLoadingData(false); // Consider data loaded after transactions arrive
        }),
        onSnapshot(doc(db, "users", user.uid, "analytics", "latest"), (snapshot) => {
          if (snapshot.exists()) {
            setAnalyticsSnapshot(snapshot.data());
          }
        }),
        onSnapshot(doc(db, "users", user.uid, "settings", "aiAllocations"), (snapshot) => {
            if (snapshot.exists()) {
                setAiSuggestion(snapshot.data().suggestion);
            }
        }),
        onSnapshot(doc(db, "users", user.uid, "aiInsights", "latest"), (snapshot) => {
            if (snapshot.exists()) {
                setAiFinancialAnalysis(snapshot.data() as any);
            }
        })
      ];

      return () => unsubscribes.forEach(unsub => unsub && unsub());
    } else if (!user) {
      setAccounts([]);
      setRules([]);
      setTransactions([]);
      setUserPlan(null);
      setSubscriptionStatus(null);
      setFeatures({});
      setAnalyticsSnapshot(null);
      setAiSuggestion(null);
      setAiFinancialAnalysis(null);
      setLoadingData(true);
    }
  }, [user]);

  const value = {
    accounts,
    rules,
    transactions,
    userPlan,
    subscriptionStatus,
    features,
    analyticsSnapshot,
    setAnalyticsSnapshot,
    aiSuggestion,
    setAiSuggestion,
    aiFinancialAnalysis,
    loadingData,
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
