
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
    if (idToken) {
        // User logged in, create the session cookie.
        try {
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
        } catch (error) {
            console.error("Failed to create session cookie:", error);
            // Handle error appropriately, e.g., show a toast to the user
        }
    } else {
        // User logged out, clear the session cookie.
        try {
            await fetch('/api/auth/session', { method: 'DELETE' });
        } catch (error) {
            console.error("Failed to clear session cookie:", error);
        }
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(true); // Set loading while we handle the session
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
        await manageSession(token);
      } else {
        setIdToken(null);
        await manageSession(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle clearing the session
    router.push("/login");
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will trigger and handle the redirect/session creation
    const nextUrl = new URLSearchParams(window.location.search).get('next') || '/dashboard';
    router.push(nextUrl);
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will trigger and handle the redirect/session creation
    const nextUrl = new URLSearchParams(window.location.search).get('next') || '/dashboard';
    router.push(nextUrl);
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
