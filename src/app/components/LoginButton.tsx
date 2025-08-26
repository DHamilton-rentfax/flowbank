"use client";

import { useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { app } from "@/firebase/client"; // your client SDK init that calls initializeApp(...)
                                          // make sure this file exists and exports `app`

type Props = {
  returnUrl?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function LoginButton({ returnUrl = "/", className = "", children = "Continue with Google" }: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    console.log("[LoginButton] click fired");
    if (loading) return;
    setLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      // Try popup first; if blocked, fallback to redirect.
      let cred;
      try {
        cred = await signInWithPopup(auth, provider);
      } catch (e: any) {
        console.warn("[LoginButton] popup failed, falling back to redirect:", e?.code || e?.message);
        await signInWithRedirect(auth, provider);
        return; // browser will navigate; no further code runs
      }

      const idToken = await cred.user.getIdToken(/* forceRefresh? */ true);
      console.log("[LoginButton] got idToken length:", idToken?.length);

      const res = await fetch("/api/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ idToken, returnUrl }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("[LoginButton] sessionLogin failed", res.status, body);
        alert(body?.error || "Session login failed");
        return;
      }

      const dest = body?.redirect || returnUrl || "/";
      console.log("[LoginButton] session cookie set, redirecting to:", dest);
      window.location.assign(dest);
    } catch (err: any) {
      console.error("[LoginButton] error:", err);
      alert(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"              // ⬅ prevent accidental <form> submit reset
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-2 border rounded-md ${className}`}
    >
      {loading ? "Signing in…" : children}
    </button>
  );
}