// src/app/demo/page.tsx
"use client";

import { useDemo } from "@/contexts/demo-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Banknote, PieChart, Sparkles, AlertCircle, PlayCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

export default function DemoDashboardPage() {
    const { accounts, transactions, rules, runAllocation } = useDemo();

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const recentTransactions = transactions.slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handleRunAllocation = (txId: string, name: string) => {
        runAllocation(txId);
        toast.success(`Allocation Simulated`, {
            description: `Ran allocation rules on the "${name}" transaction. Account balances have been updated.`,
        });
    }

    return (
        <div className="space-y-8">
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
                    ctaLink="/demo/rules"
                    ctaLabel="Manage Rules"
                />
                 <StatCard 
                    title="AI Financial Advisor" 
                    value="Ready to Analyze" 
                    icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
                    ctaLink="/demo/ai-advisor"
                    ctaLabel="Get Insights"
                />
            </div>
            
            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your last 5 recorded transactions. Click the play button on an income transaction to simulate an allocation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell className="font-medium">{tx.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={tx.isIncome ? "default" : "secondary"} className={tx.isIncome ? "bg-green-600/20 text-green-700 hover:bg-green-600/30" : ""}>
                                            {formatCurrency(tx.amount)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {tx.isIncome && (
                                            <Button variant="ghost" size="icon" onClick={() => handleRunAllocation(tx.id, tx.name)}>
                                                <PlayCircle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/demo/reporting">View All Transactions</Link>
                    </Button>
                </CardFooter>
            </Card>

        </div>
    );
}
