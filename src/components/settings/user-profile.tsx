
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

export function UserProfile() {
  const { user } = useAuth();

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
          <Input id="displayName" type="text" placeholder="Your Name" value={user?.displayName || ""} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full">Update Profile</Button>
        <Button variant="outline" className="w-full">Change Password</Button>
      </CardFooter>
    </Card>
  );
}
