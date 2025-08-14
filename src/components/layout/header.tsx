
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useApp } from "@/contexts/app-provider";

export function Header() {
  const { user } = useAuth();
  const { userPlan } = useApp();

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">FlowBank</Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/blog" className="hover:underline">Blog</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <span className="text-xs px-2 py-1 rounded bg-neutral-100">Plan: {userPlan?.name || "Free"}</span>
            </>
          ) : (
            <Link href="/login" className="px-3 py-1 rounded bg-black text-white">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
