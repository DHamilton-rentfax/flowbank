
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { collectionGroup, query, orderBy, limit, getDocs } from "firebase/firestore";
import { format } from 'date-fns';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Log {
    id: string;
    uid: string;
    type: string;
    data: any;
    receivedAt: any;
}

function getEventSummary(log: Log) {
    switch(log.type) {
        case 'checkout.session.completed':
            const plan = log.data?.subscription_details?.items?.[0]?.plan?.nickname || log.data?.metadata?.plan || 'N/A';
            return `Checkout for ${plan} plan completed.`;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            const subStatus = log.data?.status;
            const items = log.data?.items?.data || [];
            const planNames = items.map((item: any) => item.price?.lookup_key || item.plan?.nickname).join(', ');
            return `Subscription ${subStatus}: ${planNames}`;
        case 'customer.subscription.deleted':
            return `Subscription canceled.`;
        default:
            return 'General update.';
    }
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const q = query(
            collectionGroup(db, 'billingEvents'), 
            orderBy('receivedAt', 'desc'), 
            limit(100)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
            const pathParts = doc.ref.path.split('/');
            const uid = pathParts[1]; // users/{uid}/billingEvents/{eventId}
            return { id: doc.id, uid, ...doc.data() } as Log;
        });
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-secondary py-8">
            <div className="container mx-auto max-w-5xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Audit Log</CardTitle>
                        <CardDescription>Showing the last 100 billing-related events across all users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Event Type</TableHead>
                                    <TableHead>Summary</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-24" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : logs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-xs">{log.uid}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.type}</Badge>
                                        </TableCell>
                                        <TableCell>{getEventSummary(log)}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {log.receivedAt ? format(log.receivedAt.toDate(), 'PPP p') : '—'}
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
