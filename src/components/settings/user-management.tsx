
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, updateUserRole } from "@/app/actions";
import { UserData, UserRole } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setIsLoading(true);
    const result = await getAllUsers();
    if (result.success && result.users) {
      setUsers(result.users);
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not fetch users.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      toast({
        title: "Role Updated",
        description: "The user's role has been successfully changed.",
        className: "bg-accent text-accent-foreground",
      });
      // Update local state to reflect the change immediately
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update role.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user roles in the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage user roles in the application.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    <Badge variant="secondary">{user.plan.name}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {currentUser?.uid === user.uid ? (
                     <Badge>{user.role}</Badge>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={(value: UserRole) => handleRoleChange(user.uid, value)}
                    >
                      <SelectTrigger className="w-[120px] ml-auto">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
