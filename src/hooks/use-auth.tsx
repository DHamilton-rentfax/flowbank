"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getClientAuth } from '@/firebase/client';
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

type UserLike = FirebaseUser | null;

type AuthContextValue = {
  user: UserLike | undefined; // undefined while loading, null when signed out
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserLike | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const auth = getClientAuth();
      await fetch('/api/sessionLogout', { method: 'POST' });
      await signOut(auth);
      router.push('/login');
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthContextProvider');
  return ctx;
}
