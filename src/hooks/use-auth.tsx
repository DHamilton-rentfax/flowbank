
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { onAuthStateChanged, signOut, type User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getIdToken } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import type { UserAddress } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createSession = async (idToken: string) => {
    // This function can be expanded to create a server-side session cookie if needed
    console.log("Creating session for token:", idToken.substring(0, 20) + "...");
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        await createSession(token);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    router.push('/dashboard');
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push('/dashboard');
  }


  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithEmail, loginWithGoogle }}>
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
