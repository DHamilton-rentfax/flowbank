
"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const { loginWithEmail, loginWithGoogle, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const plan = searchParams.get('plan');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
        let redirectUrl = next || '/dashboard';
        if (plan) {
            redirectUrl = `/pricing?plan=${plan}&fromLogin=true`;
        }
        router.replace(redirectUrl);
    }
  }, [user, authLoading, next, plan, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await loginWithEmail(email, password);
        // The useEffect will handle the redirect after state update
    } catch(e) {
        const error = e as Error;
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
     setLoading(true);
     try {
        await loginWithGoogle();
        // The useEffect will handle redirect
     } catch(e) {
        const error = e as Error;
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
     } finally {
        setLoading(false);
     }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-md shadow-xl rounded-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Sign in to FlowBank</CardTitle>
                <CardDescription>Enter your details to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleEmailLogin} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Signing In..." : "Sign In with Email"}
                    </Button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or
                        </span>
                    </div>
                </div>

                 <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full">
                    <svg className="mr-2 h-4 w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 56.5l-63.5 61.4C333.5 99.4 293.1 86 248 86c-84.3 0-152.3 68.3-152.3 152S163.7 390 248 390c47.5 0 88.3-19.4 118.8-49.1l-63.1-61.9H248.1V261.8h239.9z"></path></svg>
                    Sign in with Google
                </Button>
                
                 <div className="mt-4 text-center text-sm text-muted-foreground">
                    Don’t have an account? <Link href="/signup" className="text-primary underline hover:text-primary/80">Sign up</Link>
                </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
