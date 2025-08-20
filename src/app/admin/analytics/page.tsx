
"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface AnalyticsData {
    totalUsers: number;
    planCounts: Record<string, number>;
    mrr: number;
    recentUsers: { email: string; plan: string }[];
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    );
}

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { getAdminAnalytics } = await import('@/app/actions/get-admin-analytics');
                const analyticsData = await getAdminAnalytics();
                setData(analyticsData as AnalyticsData);
            } catch (error) {
                const err = error as Error;
                toast({
                    title: "Error fetching analytics",
                    description: err.message,
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);
    
    const planChartData = data ? Object.entries(data.planCounts).map(([name, value]) => ({ name, users: value })) : [];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-secondary py-8">
                <div className="container mx-auto max-w-7xl">
                    <div className="space-y-4 mb-8">
                         <h1 className="text-3xl font-bold">Admin Analytics</h1>
                         <p className="text-muted-foreground">High-level metrics for your FlowBank application.</p>
                    </div>
                    {loading ? <AnalyticsSkeleton /> : data ? (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <StatCard title="Total Users" value={data.totalUsers} icon={Users} />
                                <StatCard title="Monthly Recurring Revenue" value={`$${data.mrr.toLocaleString()}`} icon={DollarSign} />
                                <StatCard title="Annual Recurring Revenue" value={`$${(data.mrr * 12).toLocaleString()}`} icon={TrendingUp} />
                            </div>
                             <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Plan Distribution</CardTitle>
                                        <CardDescription>Number of users per subscription plan.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-80">
                                       <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={planChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="users" fill="#4A90E2" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Signups</CardTitle>
                                        <CardDescription>The last 5 users to register.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                         <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Plan</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.recentUsers.map(user => (
                                                    <TableRow key={user.email}>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="capitalize">{user.plan}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <p>No analytics data available.</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

    