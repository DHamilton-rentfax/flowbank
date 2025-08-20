
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { collectionGroup, query, orderBy, limit, getDocs } from "firebase/firestore";
import { format } from 'date-fns';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Assuming shadcn/ui table
import { Badge } from '@/components/ui/badge';

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

  const downloadCSV = () => {
    const csvHeader = "User ID,Event Type,Summary,Date\n";
    const csvRows = logs.map(log => {
      const dateString = log.receivedAt ? format(log.receivedAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : '';
      const summary = getEventSummary(log).replace(/"/g, '""'); // Escape double quotes
      return `"${log.uid}","${log.type}","${summary}","${dateString}"`;
    }).join("\n");

    const csv = csvHeader + csvRows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    window.open(url); // Open in new tab or download (depends on browser)
  };

  return (
 <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription Audit Log</h1>
      <p className="text-gray-600 mb-6">Showing the last 100 billing-related events across all users.</p>

      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <caption className="mt-4">
               <button onClick={downloadCSV} className="mb-4 bg-gray-200 px-3 py-1 rounded text-sm">
                 Export CSV
               </button></caption>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
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
      )}
    </div>
  );
}
