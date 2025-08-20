
"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Send, Download } from 'lucide-react';
import { getAiCampaignTargets } from '@/app/actions/get-ai-campaign-targets';
import { sendAiTrialInvite } from '@/app/admin/actions';
import { exportCampaignData } from '@/app/actions/export-campaign-data';

interface TargetUser {
    email: string;
    plan: string;
    aiUsed: boolean;
}

export default function AiCampaignPage() {
    const [targets, setTargets] = useState<TargetUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        const fetchTargets = async () => {
            setLoading(true);
            try {
                const { targets: fetchedTargets } = await getAiCampaignTargets();
                setTargets(fetchedTargets);
            } catch (error) {
                const err = error as Error;
                toast({
                    title: "Error fetching targets",
                    description: err.message,
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchTargets();
    }, [toast]);

    const handleSendInvite = (email: string) => {
        startTransition(async () => {
            try {
                const result = await sendAiTrialInvite(email);
                if (result.success) {
                    toast({ title: "Invite Sent!", description: result.message });
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                 const err = error as Error;
                toast({
                    title: "Failed to send invite",
                    description: err.message,
                    variant: "destructive"
                });
            }
        });
    };

    const handleExport = () => {
        startTransition(async () => {
            try {
                const csvData = await exportCampaignData();
                if (csvData) {
                    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'campaign_data.csv');
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast({ title: "Export complete!", description: "Campaign data has been downloaded." });
                } else {
                     toast({ title: "Nothing to export", description: "There is no campaign data to export yet." });
                }
            } catch (error) {
                const err = error as Error;
                toast({
                    title: "Export Failed",
                    description: err.message,
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-8">
                <div className="container mx-auto max-w-4xl">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>AI Upsell Campaign</CardTitle>
                                    <CardDescription>
                                        The users below are on a paid plan but have not used the AI Financial Advisor.
                                    </CardDescription>
                                </div>
                                <Button onClick={handleExport} disabled={isPending} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>AI Feature Active</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : targets.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No eligible users found for this campaign.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            targets.map(user => (
                                                <TableRow key={user.email}>
                                                    <TableCell className="font-medium">{user.email}</TableCell>
                                                    <TableCell><Badge variant="secondary" className="capitalize">{user.plan}</Badge></TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.aiUsed ? "default" : "destructive"}>
                                                            {user.aiUsed ? "Yes" : "No"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleSendInvite(user.email)}
                                                            disabled={isPending}
                                                        >
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Send Trial
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
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

    