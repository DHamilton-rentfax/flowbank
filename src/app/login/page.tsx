"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Handle redirect flow completion (iOS/Safari/in-app browsers)
  useEffect(() => {
    getRedirectResult(auth).then((cred) => {
      if (cred?.user) router.replace("/dashboard");
    });
  }, [router]);

  // Basic UA sniff for problematic popup environments
  const needsRedirect = () => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    const inApp = /instagram|fbav|line|wechat|electron/.test(ua);
    const iOS = /iphone|ipad|ipod/.test(ua);
    const safari = /^((?!chrome|android).)*safari/.test(ua);
    return inApp || iOS || safari;
  };

  async function loginWithGoogle() {
    setErr(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      if (needsRedirect()) {
        await signInWithRedirect(auth, provider);
        return; // page will reload; redirect result handled in useEffect
      }

      const cred = await signInWithPopup(auth, provider);
      if (cred.user) router.replace("/dashboard");
    } catch (e: any) {
      // Friendly handling for common popup issues
      const code = e?.code || "";
      if (code === "auth/popup-closed-by-user") {
        setErr("The sign-in window was closed before finishing. Please try again.");
      } else if (code === "auth/cancelled-popup-request") {
        setErr("Another sign-in attempt was started. Please try again.");
      } else if (code === "auth/popup-blocked") {
        setErr("Your browser blocked the popup. Allow popups or try again.");
      } else {
        setErr(e?.message || "Sign-in failed. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="mt-1 text-sm text-gray-600">Sign in to continue to your dashboard.</p>

      {err && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <button
        onClick={loginWithGoogle}
        disabled={loading}
        className="mt-6 w-full rounded-lg border px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Continue with Google"}
      </button>
    </div>
  );
}
