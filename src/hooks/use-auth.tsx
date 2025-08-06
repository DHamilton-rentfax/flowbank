
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, signOut, type User, updateProfile, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import { verifyRecaptchaAndSignUp } from "@/app/actions";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createUserDocument } from "@/lib/plans";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string; }) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, token: string, planId?: string | null) => Promise<any>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        router.push("/dashboard");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);
  
  const logout = async () => {
    try {
      await signOut(auth);
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
  
  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string; }) => {
    if (!auth.currentUser) {
        throw new Error("No user is signed in.");
    }
    try {
        await updateProfile(auth.currentUser, updates);
        // Manually create a new user object to trigger re-render
        setUser(auth.currentUser ? { ...auth.currentUser } : null);
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
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

 const signUpWithEmail = async (email: string, password: string, token: string, planId?: string | null) => {
    const result = await verifyRecaptchaAndSignUp(email, password, token, planId);
    if (result.success && result.customToken) {
      await signInWithCustomToken(auth, result.customToken);
    } else {
      throw new Error(result.error || "Sign up failed.");
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserProfile, sendPasswordReset, signUpWithEmail, loginWithEmail }}>
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
