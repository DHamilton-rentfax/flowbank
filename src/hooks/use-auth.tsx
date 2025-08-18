
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { onAuthStateChanged, signOut, type User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getIdToken } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import type { UserAddress } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  logout: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function handles creating or clearing the server-side session cookie.
const manageSession = async (idToken: string | null) => {
    const url = '/api/auth/session';
    const method = idToken ? 'POST' : 'DELETE';
    const body = idToken ? JSON.stringify({ idToken }) : undefined;
    
    // Fire-and-forget the request.
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: body,
    }).catch(error => {
        // Log errors but don't block the user.
        console.error(`Failed to ${idToken ? 'create' : 'clear'} session:`, error);
    });
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(true); // Start loading state
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
        // Do not await. Let this run in the background.
        manageSession(token).catch(console.error);
      } else {
        setIdToken(null);
        // Do not await.
        manageSession(null).catch(console.error);
      }
      // End loading state as soon as client state is known
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle clearing the session and state
    router.push("/login");
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will trigger and handle the redirect/session creation
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  }


  return (
    <AuthContext.Provider value={{ user, idToken, loading, logout, loginWithEmail, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
