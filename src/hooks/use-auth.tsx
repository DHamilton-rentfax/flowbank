"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, googleProvider } from '@/firebase/client';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
 
type UserLike = import('firebase/auth').User | null;

type AuthContextValue = {
  user: UserLike | undefined; // undefined while loading, null when signed out
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function createSession() {
  const current = auth.currentUser;
  if (!current) return;
  const idToken = await current.getIdToken(/* forceRefresh */ true);
  const res = await fetch('/api/sessionLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
 console.error('sessionLogin failed:', res.status, err?.error);
    throw new Error(`sessionLogin failed: ${err?.error || res.statusText}`);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserLike | undefined>(undefined);
  const [loading, setLoading] = useState(true); // Initial loading state
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      // Do not redirect here; let pages decide. Only ensure session cookie exists after sign-in.
      if (u) {
        try {
          await createSession();
        } catch (e) {
          console.error(e);
        }
 } else {
 setLoading(false); // Set loading to false when user is null (signed out)
      }
    });
    return () => unsub();
  }, []);
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await createSession(); // set cookie for SSR/protected APIs
      // Route where you want after login:
      router.push('/dashboard'); // or plan-based router you already implemented
    } finally {
      setLoading(false);
    }
  }, [router]); // Depend on router

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      await createSession();
      router.push('/dashboard');
    } finally {
      setLoading(false); // Set loading to false after sign-in attempt
    }
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/sessionLogout', { method: 'POST' });
      await signOut(auth);
      router.push('/login'); // Route after logout
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}