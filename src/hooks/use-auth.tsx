
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, signOut, type User, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string; }) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
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
        // Manually update the user state to reflect changes immediately
        setUser(auth.currentUser);
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

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserProfile, sendPasswordReset }}>
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
