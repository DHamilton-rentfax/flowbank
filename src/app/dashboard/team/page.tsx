'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getTeamInfo, inviteTeamMember, removeTeamMember } from '@/app/teams/actions';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function TeamPage() {
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const { user, idToken } = useAuth();
  const { toast } = useToast();

  const fetchTeamInfo = React.useCallback(async () => {
    if (idToken) {
      try {
        const info = await getTeamInfo();
        setTeamInfo(info);
      } catch (error) {
        console.error('Failed to fetch team info:', error);
        toast({ title: 'Error', description: 'Could not fetch team details.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  }, [idToken, toast]);

  useEffect(() => {
    fetchTeamInfo();
  }, [fetchTeamInfo]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    startTransition(async () => {
      const { success, error, message } = await inviteTeamMember(inviteEmail);
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
        const { success, error, message } = await removeTeamMember(memberId);
        if (success) {
            toast({ title: 'Member Removed', description: message });
            await fetchTeamInfo();
        } else {
            toast({ title: 'Removal Failed', description: error, variant: 'destructive' });
        }
     });
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'invited':
        return <Badge variant="secondary">Invited</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-secondary py-8">
            <div className="container mx-auto max-w-4xl">
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
        </main>
        <Footer />
       </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary py-8">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle>Manage Team</CardTitle>
                  <CardDescription>Invite members, manage roles, and view seat usage.</CardDescription>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/team/audit-log">View Audit Log</Link>
                </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="flex items-center gap-2 mb-6 p-4 bg-muted/50 rounded-lg">
                <Input
                  type="email"
                  placeholder="new.member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isPending}
                />
                <Button type="submit" disabled={isPending}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isPending ? 'Sending...' : 'Send Invite'}
                </Button>
              </form>

              <div className="mb-6">
                 <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="font-medium text-muted-foreground">Seats</span>
                    <span>{teamInfo.seats.used} of {teamInfo.seats.total} used</span>
                 </div>
                 <Progress value={(teamInfo.seats.used / teamInfo.seats.total) * 100} />
              </div>

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
                        <TableCell className="capitalize">{member.role}</TableCell>
                        <TableCell>{renderStatusBadge(member.status)}</TableCell>
                        <TableCell className="text-right">
                           {teamInfo.owner !== member.id && (
                             <Button variant="ghost" size="icon" onClick={() => handleRemove(member.id)} disabled={isPending}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                           )}
                        </TableCell>
                      </TableRow>
                    ))}
                     {teamInfo.invites.map((invite: any) => (
                      <TableRow key={invite.id} className="opacity-60">
                        <TableCell className="font-medium">{invite.email}</TableCell>
                        <TableCell className="capitalize">{invite.role}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                            {renderStatusBadge(invite.status)}
                            <span className="text-xs text-muted-foreground">
                                (Invited {formatDistanceToNow(invite.invitedAt.toDate(), { addSuffix: true })})
                            </span>
                           </div>
                        </TableCell>
                         <TableCell className="text-right" />
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
