"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, loginWithEmail, loginWithGoogle } = useAuth();

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle();
      toast({ title: "Signed In with Google!"});
      router.push(next || "/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Google login failed");
      console.error("Google login error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, go straight to dashboard once auth resolves
 useEffect(() => {
    if (loading) return; // wait until auth resolves
    if (user) {
      router.replace(next || "/dashboard");
    }
  }, [user, loading, router, next]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await loginWithEmail(email.trim(), password);
      toast({
        title: "Signed In!",
      });
      router.push(next || "/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
      console.error("Email login error:", err);
      toast({
        title: "Login Failed",
        description: err?.message ?? "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

 if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Don't render the form if the user is already logged in and we're about to redirect
  // Avoid flicker while we don’t yet know if the user is logged in
  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  // If user exists, the redirect effect will fire; render nothing here
  if (user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow grid place-items-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Sign in to FlowBank</CardTitle>
            <CardDescription>Choose your preferred sign in method</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full"
              variant="outline"
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.78 4.02-1.43 1.34-3.33 2.5-6.07 2.5-4.78 0-8.8-.3-10.04-2.5C1.48 19.2 2.2 15.16 2.2 12s-.72-7.2-1.76-9.24c1.24-2.2 5.26-2.5 10.04-2.5 2.74 0 4.64 1.16 6.07 2.5 1.14 1.04 1.76 2.38 1.76 4.02-.64 0-1.04.16-1.76.48Z"
                />
              </svg>
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

            <form onSubmit={handleEmailLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
 name="email"
 autocomplete="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
 name="password"
 autocomplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={submitting}
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Signing In..." : "Sign In with Email"}
              </Button>
            </form>
          </CardContent>
          <CardContent className="px-6 pb-6 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/signup" className="underline hover:text-primary/80">
              Sign up
            </Link>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
