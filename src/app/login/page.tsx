
"use client";
import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { toast } = useToast();

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
        toast({ title: "Login Successful" });
    } catch(e) {
        const error = e as Error;
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-secondary">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Use your Google account or email to continue.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button variant="outline" onClick={() => handleLogin('google')}>
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6.06" y2="14"/><line x1="10.88" x2="15.46" y1="21.94" y2="14"/></svg>
                    Continue with Google
                </Button>
                <Button onClick={() => handleLogin('email')}>
                    Continue with Email
                </Button>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
