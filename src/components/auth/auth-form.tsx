
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ReCAPTCHA from "react-google-recaptcha";


interface AuthFormProps {
  mode: "login" | "signup";
  planId?: string | null;
}

export function AuthForm({ mode, planId }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { loginWithEmail, signUpWithEmail } = useAuth();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const title = mode === "login" ? "Welcome Back" : "Create an Account";
  const description =
    mode === "login"
      ? "Enter your credentials to access your account."
      : "Fill out the form to get started.";
  const buttonText = mode === "login" ? "Log In" : "Sign Up";

  const handleAuthError = (error: any) => {
    console.error("Firebase Auth Error:", error);
    let message = "An unknown error occurred.";
    
    const errorCode = error.code || error.name;

    switch (errorCode) {
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/user-disabled":
        message = "This account has been disabled.";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        message = "Invalid email or password.";
        break;
      case "auth/email-already-in-use":
        message = "An account already exists with this email.";
        break;
      case "auth/weak-password":
        message = "The password is too weak. Please use at least 6 characters.";
        break;
      default:
        message = error.message || "Authentication failed. Please try again.";
        break;
    }
     toast({
        title: "Authentication Failed",
        description: message,
        variant: "destructive",
       });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const token = await recaptchaRef.current?.executeAsync();
        recaptchaRef.current?.reset();
        if (!token) {
          throw new Error("reCAPTCHA verification failed. Please check the box.");
        }
        await signUpWithEmail(email, password, token, planId);
         toast({
          title: "Account Created!",
          description: "You've been successfully signed up. Redirecting...",
          className: "bg-accent text-accent-foreground",
        });
      } else {
        await loginWithEmail(email, password);
         toast({
          title: "Logged In!",
          description: "Welcome back.",
          className: "bg-accent text-accent-foreground",
        });
      }
    } catch (error) {
      handleAuthError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {mode === 'signup' && (
                <div className="flex justify-center">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        size="invisible"
                    />
                </div>
            )}
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 animate-spin" />}
              {buttonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
