
"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { User } from "firebase/auth";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { getClientAuth, db } from "@/firebase/client";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Helper to create a user document in Firestore
const createUserDocument = async (user: User, additionalData: any = {}) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { email, displayName, photoURL } = user;
        try {
            await setDoc(userRef, {
                uid: user.uid,
                email,
                displayName: displayName || email,
                photoURL,
                createdAt: serverTimestamp(),
                role: 'user', // default role
                ...additionalData,
            });
        } catch (error) {
            console.error("Error creating user document", error);
        }
    }
    return userRef;
};


interface AuthContextType {
  user: (User & { role?: string }) | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, businessType: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const auth = getClientAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await createUserDocument(user); // Ensure user doc exists
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        setUser({
            ...user,
            role: userData?.role || 'user'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
    } catch (error) {
      console.error("Google login error", error);
      throw error;
    }
  }, [auth]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email login error", error);
      throw error;
    }
  }, [auth]);

  const signUpWithEmail = useCallback(async (email: string, password: string, businessType: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await createUserDocument(result.user, { businessType });
    } catch (error) {
        console.error("Email sign up error", error);
        throw error;
    }
  }, [auth]);


  const logout = useCallback(async () => {
    try {
        await signOut(auth);
        setUser(null);
        // Optional: Add API call to clear server-side session if needed
    } catch (error) {
        console.error("Logout error", error);
    }
  }, [auth]);

  const value = useMemo(() => ({ user, loading, loginWithGoogle, loginWithEmail, signUpWithEmail, logout }), [user, loading, loginWithGoogle, loginWithEmail, signUpWithEmail, logout]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
