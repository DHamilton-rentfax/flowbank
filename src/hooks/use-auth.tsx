
"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { User } from "firebase/auth";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { getClientAuth, db } from "@/firebase/client";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Helper to create a user document
const createUserDocument = async (user: User, additionalData: any = {}) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { email, displayName, photoURL } = user;
        const createdAt = new Date();
        try {
            await setDoc(userRef, {
                uid: user.uid,
                email,
                displayName,
                photoURL,
                createdAt,
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
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, businessType: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getClientAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await createUserDocument(user); // Ensure user doc exists
        const idTokenResult = await user.getIdTokenResult();
        const userWithRole = {
            ...user,
            role: idTokenResult.claims.role || 'user'
        };
        setUser(userWithRole as User);
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
        const response = await fetch('/api/auth/session', { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Failed to clear session cookie');
        }
    } catch (error) {
        console.error("Logout error", error);
    }
  }, [auth]);

  // Session management logic
  useEffect(() => {
    let isSubscribed = true;
    const handleAuthChange = async (user: User | null) => {
        if (user) {
            const idToken = await user.getIdToken();
            // Post the token to the server to create a session cookie
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
        } else {
            // Clear the session cookie
            await fetch('/api/auth/session', { method: 'DELETE' });
        }
    };
    
    const unsubscribe = auth.onIdTokenChanged(user => {
        if (isSubscribed) {
           handleAuthChange(user);
        }
    });

    return () => {
        isSubscribed = false;
        unsubscribe();
    };
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
