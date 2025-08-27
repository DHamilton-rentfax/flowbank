
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { auth } from '@/firebase/client'; // Changed import
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

type UserLike = FirebaseUser | null;

type AuthContextValue = {
  user: UserLike | undefined; // undefined while loading, null when signed out
  loading: boolean;
  logout: () => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<any>;
  loginWithEmail: (email: string, pass: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function handleSuccessfulLogin(credential: any) {
    const idToken = await credential.user.getIdToken(true);
    const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Session login failed');
    }
}


export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserLike | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Direct use of the imported 'auth' instance
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signupWithEmail = useCallback(async (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    await handleSuccessfulLogin(credential);
    return credential;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    await handleSuccessfulLogin(credential);
    return credential;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      await signOut(auth);
      router.push('/login');
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
      // setUser(null) is handled by onAuthStateChanged
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, signupWithEmail, loginWithEmail, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthContextProvider');
  return ctx;
}
