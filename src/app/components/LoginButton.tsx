
"use client";

import { useEffect, useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { app } from "@/firebase/client";

export default function LoginButton({ returnUrl = "/", className = "", children = "Continue with Google" }:{
  returnUrl?: string; className?: string; children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const inIframe = typeof window !== "undefined" && window.top !== window.self;

  useEffect(() => {
    const auth = getAuth(app);
    getRedirectResult(auth)
      .then(async (cred) => {
        if (!cred) return;
        setLoading(true);
        const idToken = await cred.user.getIdToken(true);
        await fetch("/api/sessionLogin", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
          body: JSON.stringify({ idToken, returnUrl }),
        });
        window.location.assign(returnUrl);
      })
      .catch((err) => {
        console.error("Redirect result error:", err);
      }).finally(() => setLoading(false));
  }, [returnUrl]);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      if (inIframe) { 
        await signInWithRedirect(auth, provider); 
        // Redirect will happen, no further code in this block will execute.
        return; 
      }
      // Try popup first for non-iframe environments
      try {
        const cred = await signInWithPopup(auth, provider);
        const idToken = await cred.user.getIdToken(true);
        const r = await fetch("/api/sessionLogin", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
          body: JSON.stringify({ idToken, returnUrl }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || "Session login failed");
        const dest = data.redirect || data.url || returnUrl || "/";
        window.location.assign(dest);
      } catch (err: any) {
        // If popup fails (e.g., blocked), fall back to redirect.
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
           // User closed popup, do nothing.
           setLoading(false);
           return;
        }
        console.warn("Popup sign-in failed, falling back to redirect:", err);
        await signInWithRedirect(auth, provider); 
      }
    } catch(err) {
        console.error("Sign-in error", err);
        setLoading(false);
    }
  };

  return (
    <button type="button" onClick={onClick} disabled={loading} className={className}>
      {loading ? "Signing in…" : children}
    </button>
  );
}
