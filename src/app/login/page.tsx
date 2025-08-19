
"use client";

import React, { useState, useEffect } from "react";
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
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { loginWithEmail, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const plan = searchParams.get('plan');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
                         <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                             >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Signing In..." : "Sign In"}
                    </Button>
                </form>
                
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
