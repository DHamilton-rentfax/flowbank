
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useApp } from "@/contexts/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";

export function Header() {
  const { user, logout } = useAuth();
  const { userPlan } = useApp();

  const planName = userPlan?.name || "Free";

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">FlowBank</Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm hover:underline">Pricing</Link>
          <Link href="/blog" className="text-sm hover:underline">Blog</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
              <Badge variant="outline" className="capitalize">
                {planName}
              </Badge>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Link href="/login" className="px-3 py-1 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
