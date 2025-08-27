
'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Send, Lock } from 'lucide-react';
import Link from 'next/link';
import { inviteTeamMember, removeTeamMember, updateTeamMemberRole } from '@/app/teams/actions';

export default function TeamPage() {
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTeamInfo = React.useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch this from a server action.
      // For now, we simulate this data.
      const info = {
          owner: user?.uid,
          seats: { used: 3, total: 5 },
          members: [
              { id: 'user-1', email: user?.email, role: 'owner', status: 'active' },
              { id: 'user-2', email: 'jane@example.com', role: 'admin', status: 'active' },
              { id: 'user-3', email: 'bob@example.com', role: 'member', status: 'active' },
          ],
          invites: [
              { id: 'invite-1', email: 'new@example.com', invitedAt: new Date() }
          ]
      };
      setTeamInfo(info);
    } catch (error) {
      console.error('Failed to fetch team info:', error);
      const err = error as Error;
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user) {
        fetchTeamInfo();
    }
  }, [fetchTeamInfo, user]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
        toast({ title: 'Invalid Email', description: 'Please enter a valid email address.', variant: 'destructive' });
        return;
    }

    startTransition(async () => {
      // const { success, error, message } = await inviteTeamMember(inviteEmail);
      // Simulating success for now
      const success = true;
      const message = `Invitation sent to ${inviteEmail}.`;
      const error = '';

      if (success) {
        toast({ title: 'Success!', description: message });
        setInviteEmail('');
        await fetchTeamInfo();
      } else {
        toast({ title: 'Invitation Failed', description: error, variant: 'destructive' });
      }
    });
  };
  
  const handleRemove = (memberId: string) => {
     startTransition(async () => {
        // const { success, error, message } = await removeTeamMember(memberId);
        const success = true;
        const message = `Member removed.`;
        const error = '';
        if (success) {
            toast({ title: 'Member Removed', description: message });
            await fetchTeamInfo();
        } else {
            toast({ title: 'Removal Failed', description: error, variant: 'destructive' });
        }
     });
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    startTransition(async () => {
      // const { success, error, message } = await updateTeamMemberRole(memberId, newRole);
      const success = true;
      const message = `Role updated.`;
      const error = '';
      if (success) {
        toast({ title: 'Role Updated!', description: message });
        await fetchTeamInfo();
      } else {
        toast({ title: 'Update Failed', description: error, variant: 'destructive' });
      }
    });
  };

  const seatUsageText = useMemo(() => {
    if (!teamInfo?.seats) return '...';
    return `${teamInfo.seats.used} of ${teamInfo.seats.total} seats used`;
  }, [teamInfo]);
  
  const isOwner = user?.uid === teamInfo?.owner;

  if (loading) {
    return (
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
             </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-primary">Team Management</h1>
                <p className="text-muted-foreground">{seatUsageText}</p>
            </div>
             <Button asChild variant="outline">
                <Link href="/dashboard/team/audit-log">View Audit Log</Link>
            </Button>
        </div>

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
              disabled={isPending || !isOwner}
            />
            <Button type="submit" disabled={isPending || !isOwner}>
              <Send className="mr-2 h-4 w-4" />
              {isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
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
                {teamInfo.members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.email}</TableCell>
                    <TableCell>
                      {isOwner && member.id !== teamInfo.owner ? (
                         <Select
                            value={member.role}
                            onValueChange={(value) => handleRoleChange(member.id, value)}
                            disabled={isPending}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                      ) : (
                        <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">{member.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {isOwner && member.id !== teamInfo.owner ? (
                         <Button variant="ghost" size="icon" onClick={() => handleRemove(member.id)} disabled={isPending}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                         </Button>
                       ) : (
                         <Lock className="h-4 w-4 text-muted-foreground inline-block" />
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
        </CardHeader>
        <CardContent>
             <ul className="space-y-2 text-sm">
                {teamInfo.invites.length === 0 ? (
                <li className="text-muted-foreground text-center py-4">No pending invites.</li>
                ) : (
                teamInfo.invites.map((invite: any) => (
                    <li key={invite.id} className="flex justify-between items-center border-b p-2">
                    <span>{invite.email}</span>
                    <span className="text-muted-foreground text-xs">
                        Invited {invite.invitedAt ? formatDistanceToNow(invite.invitedAt, { addSuffix: true }) : ''}
                    </span>
                    </li>
                ))
                )}
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
