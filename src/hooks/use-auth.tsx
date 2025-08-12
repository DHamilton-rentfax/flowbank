
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { onAuthStateChanged, signOut, type User, updateProfile, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithCustomToken, getIdToken } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import { signUpUser } from "@/app/actions";
import type { UserAddress } from "@/lib/types";

interface SignUpParams {
    email: string;
    password: string;
    displayName: string;
    phone: string;
    businessName?: string;
    address: UserAddress;
    planId?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  sendPasswordReset: () => Promise<void>;
  signUpWithEmail: (params: SignUpParams) => Promise<any>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createSession = async (idToken: string) => {
    const res = await fetch("/api/auth/sessionLogin", { 
        method: "POST", 
        body: JSON.stringify({ idToken }), 
        headers: { "Content-Type": "application/json" } 
    });

    if (!res.ok) {
        const errorBody = await res.json();
        console.error("sessionLogin failed:", res.status, errorBody.error);
        throw new Error(`sessionLogin failed: ${errorBody.error || 'Unknown error'}`);
    }
}

const clearSession = async () => {
     const res = await fetch("/api/auth/sessionLogout", { method: "POST" });
     if (!res.ok) {
        throw new Error("Failed to clear session");
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    try {
      await signOut(auth);
      await clearSession();
      router.push("/login");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendPasswordReset = async () => {
    if (!auth.currentUser?.email) {
        throw new Error("No user email found to send reset link.");
    }
    try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
    } catch(error) {
        console.error("Error sending password reset email:", error);
        throw (error as Error);
    }
  }

 const signUpWithEmail = async (params: SignUpParams) => {
    const result = await signUpUser(params);
    if (result.success && result.customToken) {
      const userCredential = await signInWithCustomToken(auth, result.customToken);
      const idToken = await getIdToken(userCredential.user, true);
      await createSession(idToken);
      router.push('/dashboard');
    } else {
      throw new Error(result.error || "Sign up failed.");
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(userCredential.user, true);
    await createSession(idToken);
    router.push('/dashboard');
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, sendPasswordReset, signUpWithEmail, loginWithEmail }}>
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

    