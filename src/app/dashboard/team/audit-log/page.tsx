'use client';

import React, { useState, useEffect } from 'react';
import { getTeamAuditLogs } from '@/app/teams/actions';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Log {
    id: string;
    type: string;
    actorId: string;
    details: any;
    timestamp: any;
}

function getLogSummary(log: Log) {
    switch(log.type) {
        case 'MEMBER_INVITED':
            return `Invited ${log.details.invitedEmail}`;
        case 'MEMBER_JOINED':
            return `${log.details.joinedEmail} joined the team.`;
        case 'MEMBER_REMOVED':
            return `Removed ${log.details.removedEmail}.`;
        default:
            return 'Unknown action';
    }
}

function getBadgeVariant(logType: string) {
    if (logType.includes('JOINED')) return 'default';
    if (logType.includes('REMOVED')) return 'destructive';
    return 'secondary';
}

export default function TeamAuditLogPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const { idToken } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (idToken) {
            const fetchLogs = async () => {
                setLoading(true);
                try {
                    const { logs: fetchedLogs } = await getTeamAuditLogs();
                    setLogs(fetchedLogs as Log[]);
                } catch (error) {
                    toast({ title: 'Error', description: 'Could not fetch audit logs.', variant: 'destructive' });
                } finally {
                    setLoading(false);
                }
            };
            fetchLogs();
        }
    }, [idToken, toast]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-8">
                <div className="container mx-auto max-w-4xl">
                     <div className="mb-4">
                        <Button asChild variant="ghost">
                            <Link href="/dashboard/team">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Team Management
                            </Link>
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Audit Log</CardTitle>
                            <CardDescription>A record of all membership changes for your team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead>Performed By (User ID)</TableHead>
                                            <TableHead className="text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-4 w-28" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : logs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                    No audit records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : logs.map(log => (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    <Badge variant={getBadgeVariant(log.type)}>
                                                        {log.type.replace('MEMBER_', '')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getLogSummary(log)}</TableCell>
                                                <TableCell className="font-mono text-xs">{log.actorId}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {log.timestamp ? format(log.timestamp.toDate(), 'PPP p') : '—'}
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
