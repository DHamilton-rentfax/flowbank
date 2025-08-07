
"use client";

import React, { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { auth } from "@/firebase/client"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Extend the Window interface to include our reCAPTCHA verifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function PhoneAuthForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This effect sets up the reCAPTCHA verifier instance when the component mounts.
    // It will be invisible and attached to the button.
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: (response: any) => {
              console.log("reCAPTCHA solved, automatically submitting form.");
            },
        });
        window.recaptchaVerifier.render();
    }
  }, []);

  const sendCode = async () => {
    if (!phoneNumber) {
        toast({ title: "Phone number is required", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
      const verifier = window.recaptchaVerifier;
      if (verifier) {
        const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
        setConfirmationResult(result);
        setOtpSent(true);
        toast({ title: "OTP Sent!", description: "A one-time password has been sent to your phone." });
      } else {
        throw new Error("reCAPTCHA verifier not initialized.");
      }
    } catch (err: any) {
      toast({ title: "Error sending OTP", description: err.message, variant: "destructive" });
      // Reset reCAPTCHA on error
       if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
            if ((window as any).grecaptcha) {
                (window as any).grecaptcha.reset(widgetId);
            }
        });
       }
    } finally {
        setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!otp) {
        toast({ title: "OTP is required", variant: "destructive" });
        return;
    }
    if (!confirmationResult) {
        toast({ title: "Please send an OTP first", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    try {
      const res = await confirmationResult.confirm(otp);
      toast({ title: "Success!", description: "You've been signed in successfully.", className: "bg-accent text-accent-foreground" });
      console.log(res.user);
    } catch (err: any) {
      toast({ title: "OTP verification failed", description: err.message, variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign In with Phone</CardTitle>
        <CardDescription>
            {otpSent ? "Enter the OTP we sent to your phone." : "Enter your phone number to receive a one-time password."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!otpSent ? (
             <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 555-555-5555"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                />
            </div>
        ) : (
            <div className="grid gap-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                />
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {!otpSent ? (
            <Button onClick={sendCode} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                Send Code
            </Button>
        ) : (
             <Button onClick={verifyCode} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                Verify OTP & Sign In
            </Button>
        )}
         <div id="recaptcha-container"></div>
      </CardFooter>
    </Card>
  );
}
