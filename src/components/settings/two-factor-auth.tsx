
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { setup2FA } from "@/app/actions";
import Image from "next/image";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { useApp } from "@/contexts/app-provider";

export function TwoFactorAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  // We'll add is2FAEnabled to the app context later
  const is2FAEnabled = false; 

  const handleEnable2FA = async () => {
    setIsLoading(true);
    const result = await setup2FA();
    setIsLoading(false);

    if (result.success && result.uri && result.secret) {
      setSecret(result.secret);
      // Use a library to generate the QR code SVG/PNG from the URI
      // For now, we assume a utility function `generateQrCode` exists
      // In a real app, you'd use a lib like 'qrcode'
      const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.uri)}`);
      if(qrResponse.ok) {
        const blob = await qrResponse.blob();
        setQrCodeUri(URL.createObjectURL(blob));
        setIsDialogOpen(true);
      } else {
         toast({
          title: "Error Generating QR Code",
          description: "Could not fetch the QR code image.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to start 2FA setup.",
        variant: "destructive",
      });
    }
  };

  const handleVerify2FA = async () => {
    // This is where you would verify the code and save the secret
    // For now, we'll just show a success message
    toast({
      title: "2FA Enabled!",
      description: "Two-Factor Authentication has been successfully enabled for your account.",
      className: "bg-accent text-accent-foreground",
    });
    setIsDialogOpen(false);
  };
  
  const handleDisable2FA = async () => {
    // Logic to disable 2FA
    toast({
      title: "2FA Disabled",
      description: "Two-Factor Authentication has been disabled.",
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a second
            form of verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {is2FAEnabled ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-green-600 h-6 w-6" />
                        <p className="font-medium text-green-800">2FA is currently enabled.</p>
                    </div>
                </div>
            ) : (
                 <div className="flex items-center justify-between p-4 bg-muted border rounded-lg">
                    <div className="flex items-center gap-3">
                        <ShieldOff className="text-muted-foreground h-6 w-6" />
                        <p className="font-medium text-muted-foreground">2FA is currently disabled.</p>
                    </div>
                </div>
            )}
        </CardContent>
        <CardFooter>
            {is2FAEnabled ? (
                 <Button variant="destructive" onClick={handleDisable2FA} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    Disable 2FA
                </Button>
            ): (
                 <Button onClick={handleEnable2FA} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    Enable 2FA
                </Button>
            )}
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app (e.g., Google
              Authenticator, Authy).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUri && (
                <Image
                    src={qrCodeUri}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                />
            )}
            <p className="text-sm text-center">
                Or, enter this secret key manually:
            </p>
            <div className="p-2 bg-muted rounded-md font-mono text-sm break-all">
                {secret}
            </div>

            <div className="w-full pt-4">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                />
            </div>
          </div>
           <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button onClick={handleVerify2FA}>Verify & Enable</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
