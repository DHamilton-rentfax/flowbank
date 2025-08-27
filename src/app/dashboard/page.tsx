
"use client";

import { useApp } from "@/contexts/app-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Banknote, PieChart, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function StatCard({ title, value, icon, ctaLink, ctaLabel }: { title: string, value: string, icon: React.ReactNode, ctaLink?: string, ctaLabel?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
            {ctaLink && ctaLabel && (
                 <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="-ml-4">
                        <Link href={ctaLink}>
                            {ctaLabel}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

export default function DashboardPage() {
    const { accounts, transactions, rules, loadingData, subscriptionStatus } = useApp();

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const recentTransactions = transactions.slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    if (loadingData) {
        return <LoadingSpinner className="mt-16" />;
    }
    
    if (subscriptionStatus && ['past_due', 'unpaid'].includes(subscriptionStatus)) {
        return (
            <div className="container mx-auto p-4 sm:p-6 md:p-8">
                 <Card className="border-destructive">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <div>
                            <CardTitle className="text-destructive">Payment Issue</CardTitle>
                            <CardDescription>
                                Your subscription payment has failed. Please update your payment method to restore full access.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="destructive">
                            <Link href="/billing">Update Payment Information</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Your financial command center.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Total Balance" 
                    value={formatCurrency(totalBalance)} 
                    icon={<Banknote className="h-4 w-4 text-muted-foreground" />} 
                />
                <StatCard 
                    title="Allocation Rules" 
                    value={`${rules.length} Active`} 
                    icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
                    ctaLink="/rules"
                    ctaLabel="Manage Rules"
                />
                 <StatCard 
                    title="AI Financial Advisor" 
                    value="Ready to Analyze" 
                    icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
                    ctaLink="/dashboard/ai-advisor"
                    ctaLabel="Get Insights"
                />
            </div>
            
            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your last 5 recorded transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{tx.date}</TableCell>
                                        <TableCell className="font-medium">{tx.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={tx.isIncome ? "default" : "secondary"} className={tx.isIncome ? "bg-green-600/20 text-green-700" : ""}>
                                                {formatCurrency(tx.amount)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No transactions found. Connect your bank to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/reporting">View All Transactions</Link>
                    </Button>
                </CardFooter>
            </Card>

        </div>
    );
}
