
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

export function UserProfile() {
  const { user, updateUserProfile, sendPasswordReset } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);
  
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
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
    } catch (error) {
         toast({
            title: "Request Failed",
            description: (error as Error).message,
            variant: "destructive",
        });
    } finally {
        setIsSendingReset(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Manage your account details and password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email || ""} disabled />
        </div>
         <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input 
            id="displayName" 
            type="text" 
            placeholder="Your Name" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isUpdating || isSendingReset}
          />
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
      </CardFooter>
    </Card>
  );
}
