
"use client";
import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";

export default function Login() {
  const { loginWithEmail, loginWithGoogle, user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const plan = searchParams.get('plan');

  React.useEffect(() => {
    if (!loading && user) {
        let redirectUrl = next || '/dashboard';
        if (plan) {
            redirectUrl = `/pricing?plan=${plan}&fromLogin=true`;
        }
        router.replace(redirectUrl);
    }
  }, [user, loading, next, plan, router]);

  const handleLogin = async (provider: 'email' | 'google') => {
    try {
        if (provider === 'google') {
            await loginWithGoogle();
        } else {
            // This is a placeholder. You would have a form for email/password.
            const email = prompt("Enter your email");
            const password = prompt("Enter your password");
            if (email && password) {
                await loginWithEmail(email, password);
            }
        }
        // The useEffect will handle the redirect after state update
    } catch(e) {
        const error = e as Error;
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-sm shadow-xl rounded-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Sign in to FlowBank</CardTitle>
                <CardDescription>Start automating your finances in minutes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button variant="outline" onClick={() => handleLogin('google')}>
                    <svg className="mr-2 h-4 w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 56.5l-63.5 61.4C333.5 99.4 293.1 86 248 86c-84.3 0-152.3 68.3-152.3 152S163.7 390 248 390c47.5 0 88.3-19.4 118.8-49.1l-63.1-61.9H248.1V261.8h239.9z"></path></svg>
                    Sign in with Google
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>
                <Button onClick={() => handleLogin('email')} variant="secondary">
                    Sign in with Email
                </Button>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
