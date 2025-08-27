// src/app/demo/teams/page.tsx
"use client";

import React, { useState } from "react";
import { produce } from "immer";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Send, Lock } from 'lucide-react';

type Member = {
    id: string;
    email: string;
    role: "Owner" | "Admin" | "Member";
    status: "active" | "invited";
};

const initialMembers: Member[] = [
    { id: 'user1', email: "owner@example.com", role: "Owner", status: 'active' },
    { id: 'user2', email: "admin@example.com", role: "Admin", status: 'active' },
    { id: 'user3', email: "member@example.com", role: "Member", status: 'active' },
    { id: 'user4', email: "pending@example.com", role: "Member", status: 'invited' },
];


export default function DemoTeamPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
        toast.error('Invalid Email', { description: 'Please enter a valid email address.' });
        return;
    }
    const newInvite: Member = {
        id: `demo_${Date.now()}`,
        email: inviteEmail,
        role: "Member",
        status: 'invited',
    };
    setMembers(produce(members, draft => { draft.push(newInvite) }));
    setInviteEmail('');
    toast.success("Invite Sent!", { description: `${inviteEmail} has been invited to join the team.`});
  };
  
  const handleRemove = (memberId: string) => {
     setMembers(produce(members, draft => {
        return draft.filter(m => m.id !== memberId);
     }));
     toast.info("Member Removed");
  };

  const handleRoleChange = (memberId: string, newRole: Member["role"]) => {
    setMembers(produce(members, draft => {
        const member = draft.find(m => m.id === memberId);
        if (member) member.role = newRole;
    }));
    toast.success("Member role updated");
  };

  const ownerId = members.find(m => m.role === 'Owner')?.id;

  return (
    <div className="space-y-8">
        <Card>
        <CardHeader>
            <CardTitle>Invite New Member</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleInvite} className="flex items-center gap-2">
            <Input
                type="email"
                placeholder="new.member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Send Invite
            </Button>
            </form>
        </CardContent>
        </Card>
        
        <Card>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage roles and access for your team.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {members.map((member: Member) => (
                    <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.email}</TableCell>
                    <TableCell>
                        {member.id !== ownerId ? (
                            <Select
                            value={member.role}
                            onValueChange={(value) => handleRoleChange(member.id, value as Member["role"])}
                            >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Member">Member</SelectItem>
                            </SelectContent>
                            </Select>
                        ) : (
                        <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'outline'} className="capitalize">{member.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {member.id !== ownerId ? (
                            <Button variant="ghost" size="icon" onClick={() => handleRemove(member.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        ) : (
                            <Lock className="h-4 w-4 text-muted-foreground inline-block" title="Owner cannot be removed" />
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
  );
}
