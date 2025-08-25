"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/use-auth";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function SignupPage() {
  // Handle both spellings without changing your context types
  const auth = useAuth() as any;
  const signup =
    auth?.signUpWithEmail ?? auth?.signupWithEmail; // pick whichever exists

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof signup !== "function") {
      alert("Signup function is not available.");
      return;
    }
    setBusy(true);
    try {
      await signup(email, password);
      // optional: route to dashboard or sign-in after account creation
      window.location.href = "/signin";
    } catch (e: any) {
      setErr(e?.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  };

 return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
 {/* Top nav/back */}
        <div className="mb-6">
 <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground">
 ← Back to sign in
 </Link>
        </div>

 {/* Card */}
 <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h1 className="mb-4 text-2xl font-semibold">Create your account</h1>
 <p className="mb-6 text-sm text-muted-foreground">
          Start your FlowBank journey in seconds.
 </p>

 <form onSubmit={onSubmit} className="space-y-3" autoComplete="on">
 <div className="space-y-1.5">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
 </div>

 <div className="space-y-1.5">
 <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
          className="pr-20"
        />
 <button
 type="button"
 onClick={() => setShow((s) => !s)}
 className="absolute inset-y-0 right-2 my-1 rounded px-2 text-sm text-muted-foreground hover:text-foreground"
                >
 {show ? "Hide" : "Show"}
 </button>
 </div>
 <p className="text-[11px] text-muted-foreground">
 Use at least 8 characters with a mix of letters and numbers.
 </p>
 </div>

        {err && (
 <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
 {err}
 </div>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Creating..." : "Sign up"}
        </Button>
 </form>

 <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
 <Link href="/signin" className="font-medium hover:underline">
 Sign in
 </Link>
 </p>
 </div>
      </div>
    </main>
  );
}