
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
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";


export default function Signup() {
  const { signUpWithEmail, loginWithGoogle, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
        router.replace(next || '/onboarding');
    }
  }, [user, authLoading, router, next]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType) {
        toast({ title: "Missing Field", description: "Please select a business type.", variant: "destructive" });
        return;
    }
    if (!agree) {
      toast({ title: "Agreement Required", description: "You must agree to the Terms of Service and Privacy Policy.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
        await signUpWithEmail(email, password, businessType);
        toast({ title: "Account created!", description: "Welcome to FlowBank. Let's get you set up." });
        // The useEffect will handle the redirect
    } catch(e) {
        const error = e as Error;
        toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
        await loginWithGoogle();
        toast({ title: "Signed In with Google!", description: "Welcome."});
        // The useEffect will handle the redirect
    } catch(e) {
        const error = e as Error;
        toast({ title: "Google Login Failed", description: error.message, variant: "destructive" });
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
                <CardTitle className="text-2xl">Create your Account</CardTitle>
                <CardDescription>Join FlowBank to automate your finances.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
                        Continue with Google
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

                    <form onSubmit={handleEmailSignup} className="grid gap-4">
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
 name="email"
 autocomplete="email"
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
 name="password"
 autocomplete="current-password"
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
                         <div className="grid gap-2">
                            <Label htmlFor="businessType">I am a...</Label>
                            <Select value={businessType} onValueChange={setBusinessType} required disabled={loading}>
                                <SelectTrigger id="businessType">
                                    <SelectValue placeholder="Select your business type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="freelancer">Freelancer</SelectItem>
                                    <SelectItem value="solo-entrepreneur">Solo Entrepreneur</SelectItem>
                                    <SelectItem value="llc-corp">Corporation / LLC</SelectItem>
                                    <SelectItem value="non-profit">Non-profit</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="terms" checked={agree} onCheckedChange={(checked) => setAgree(Boolean(checked))} />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                            </label>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Creating Account..." : "Create Account with Email"}
                        </Button>
                    </form>
                </div>
                
                 <div className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account? <Link href="/login" className="text-primary underline hover:text-primary/80">Sign in</Link>
                </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
