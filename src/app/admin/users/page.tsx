"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { getAllUsers } from '@/app/actions/get-all-users';
import { updateUserRole } from '@/app/actions/update-user-role';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { grantHighestTierPlan } from '@/app/admin/actions';

interface User {
    uid: string;
    email: string;
    role: 'admin' | 'user';
    plan: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchUsers = React.useCallback(async () => {
        setLoading(true);
        try {
            const { users: fetchedUsers } = await getAllUsers();
            setUsers(fetchedUsers as User[]);
        } catch (error) {
            const err = error as Error;
            toast({
                title: "Error fetching users",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = (uid: string, newRole: 'admin' | 'user') => {
        startTransition(async () => {
            try {
                const result = await updateUserRole(uid, newRole);
                if (result.success) {
                    toast({ title: "Success!", description: result.message });
                    await fetchUsers(); // Refresh the user list
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                const err = error as Error;
                toast({
                    title: "Failed to update role",
                    description: err.message,
                    variant: "destructive"
                });
            }
        });
    };
    
    const handleGrantPro = (email: string) => {
        startTransition(async () => {
            try {
                const result = await grantHighestTierPlan(email);
                 if (result.success) {
                    toast({ title: "Success!", description: result.message });
                    await fetchUsers();
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                 const err = error as Error;
                toast({
                    title: "Failed to grant plan",
                    description: err.message,
                    variant: "destructive"
                });
            }
        });
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-8">
                <div className="container mx-auto max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                View, edit, and manage roles for all users in the system.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                                                    <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : users.map(user => (
                                            <TableRow key={user.uid}>
                                                <TableCell className="font-medium">{user.email}</TableCell>
                                                <TableCell><Badge variant="outline" className="capitalize">{user.plan}</Badge></TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value) => handleRoleChange(user.uid, value as 'admin' | 'user')}
                                                        disabled={isPending}
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {user.plan === 'free' && (
                                                        <Button 
                                                            variant="secondary"
                                                            size="sm"
                                                            disabled={isPending}
                                                            onClick={() => handleGrantPro(user.email)}
                                                        >
                                                            Grant Pro
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}