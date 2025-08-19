
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { onAuthStateChanged, signOut, type User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getIdToken } from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import type { UserAddress } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  logout: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, businessType: string) => Promise<void>;
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

  const signUpWithEmail = async (email: string, password: string, businessType: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a document in Firestore for the new user
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.email, // Default display name to email
        businessType: businessType,
        createdAt: serverTimestamp(),
        plan: { id: 'free', name: 'Free' } // Default to free plan
    });

    // onAuthStateChanged will handle the session creation and redirect
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Create a document in Firestore for the new user on first sign-in
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        plan: { id: 'free', name: 'Free' }
    }, { merge: true }); // Use merge to avoid overwriting existing data if they've signed up before
  }


  return (
    <AuthContext.Provider value={{ user, idToken, loading, logout, loginWithEmail, signUpWithEmail, loginWithGoogle }}>
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
