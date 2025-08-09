
"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useApp } from "@/contexts/app-provider";
import { createCustomerPortalSession, createTestCharge } from "@/app/actions";
import { Badge } from "../ui/badge";
import type { UserAddress } from "@/lib/types";

function TestIntegration() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleTestCharge = async () => {
        setIsLoading(true);
        const result = await createTestCharge();
        if (result.success) {
            toast({
                title: "Test Charge Successful",
                description: result.message,
                className: "bg-accent text-accent-foreground",
            });
        } else {
             toast({
                title: "Test Charge Failed",
                description: result.error,
                variant: "destructive",
            });
        }
        setIsLoading(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Test Stripe Integration</CardTitle>
                <CardDescription>
                    Click the button below to create a $1.00 test charge. This will verify that your Stripe API keys are configured correctly.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button className="w-full" onClick={handleTestCharge} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    Create $1.00 Test Charge
                </Button>
            </CardFooter>
        </Card>
    )
}

export function UserProfile() {
  const { user, updateUserProfile, sendPasswordReset } = useAuth();
  const { userPlan, allUsers, loadingData } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const { toast } = useToast();

  const currentUserData = allUsers.find(u => u.uid === user?.uid);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState<UserAddress>({
    street: "", city: "", state: "", postalCode: "", country: ""
  });


  useEffect(() => {
    if (currentUserData) {
        setDisplayName(currentUserData.displayName || "");
        setPhone(currentUserData.phone || "");
        setBusinessName(currentUserData.businessName || "");
        setAddress(currentUserData.address || { street: "", city: "", state: "", postalCode: "", country: "" });
    }
  }, [currentUserData]);
  
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
        // Here you would also update the document in Firestore
        await updateUserProfile({ displayName });
        toast({
            title: "Profile Updated",
            description: "Your display name has been successfully updated.",
            className: "bg-accent text-accent-foreground",
        });
    } catch (error) {
        toast({
            title: "Update Failed",
            description: (error as Error).message,
            variant: "destructive",
        });
    } finally {
        setIsUpdating(false);
    }
  }

  const handlePasswordReset = async () => {
    setIsSendingReset(true);
    try {
        await sendPasswordReset();
         toast({
            title: "Password Reset Email Sent",
            description: "Please check your inbox for instructions to reset your password.",
            className: "bg-accent text-accent-foreground",
        });
    } catch(error) {
         toast({
            title: "Request Failed",
            description: (error as Error).message,
            variant: "destructive",
        });
    } finally {
        setIsSendingReset(false);
    }
  }

  const handleManageSubscription = async () => {
    if (!user) return;
    setIsManagingSubscription(true);
    const result = await createCustomerPortalSession(user.uid);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not open subscription management.",
        variant: "destructive",
      });
      setIsManagingSubscription(false);
    }
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>User Profile</CardTitle>
                        <CardDescription>
                        Manage your account details and password.
                        </CardDescription>
                    </div>
                    {userPlan && (
                        <Badge variant={userPlan.id !== 'free' ? 'default' : 'secondary'}>{userPlan.name} Plan</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                            id="displayName" 
                            type="text" 
                            placeholder="Your Name" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={isUpdating}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                            id="phone" 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isUpdating}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input 
                        id="businessName" 
                        type="text" 
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        disabled={isUpdating}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Address</Label>
                    <Input 
                        placeholder="Street Address" 
                        value={address.street} 
                        onChange={e => setAddress(a => ({...a, street: e.target.value}))} 
                        disabled={isUpdating} 
                    />
                    <div className="flex gap-2">
                        <Input 
                            placeholder="City" 
                            value={address.city} 
                            onChange={e => setAddress(a => ({...a, city: e.target.value}))} 
                            disabled={isUpdating} 
                        />
                        <Input 
                            placeholder="State" 
                            value={address.state} 
                            onChange={e => setAddress(a => ({...a, state: e.target.value}))} 
                            disabled={isUpdating} 
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Postal Code" 
                            value={address.postalCode} 
                            onChange={e => setAddress(a => ({...a, postalCode: e.target.value}))} 
                            disabled={isUpdating} 
                        />
                        <Input 
                            placeholder="Country" 
                            value={address.country} 
                            onChange={e => setAddress(a => ({...a, country: e.target.value}))} 
                            disabled={isUpdating} 
                        />
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" onClick={handleUpdateProfile} disabled={isUpdating || isSendingReset}>
                    {isUpdating && <Loader2 className="mr-2 animate-spin" />}
                    Update Profile
                </Button>
                <Button variant="outline" className="w-full" onClick={handlePasswordReset} disabled={isUpdating || isSendingReset}>
                    {isSendingReset && <Loader2 className="mr-2 animate-spin" />}
                    Change Password
                </Button>
                {userPlan && userPlan.stripeSubscriptionId && (
                    <Button variant="outline" className="w-full" onClick={handleManageSubscription} disabled={isManagingSubscription}>
                        {isManagingSubscription && <Loader2 className="mr-2 animate-spin" />}
                        Manage Subscription
                    </Button>
                )}
            </CardFooter>
        </Card>
        
    </div>
  );
}
