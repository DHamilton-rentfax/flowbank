
"use client";

import React, { useState, useTransition } from 'react';
import { useApp } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, TrendingUp, ReceiptText, AlertTriangle } from 'lucide-react';
import { getAIFinancialAnalysis } from '@/app/actions/get-ai-financial-analysis';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import PlanGate from '@/components/PlanGate';

type AnalysisResult = Awaited<ReturnType<typeof getAIFinancialAnalysis>>;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function AiAdvisorPage() {
    const { transactions, aiFinancialAnalysis: initialAnalysis, setAiFinancialAnalysis } = useApp();
    const [businessType, setBusinessType] = useState('SaaS Platform');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAnalysis = () => {
        if (transactions.length === 0) {
            toast({ title: 'No Data', description: 'Please connect a bank and sync transactions before running an analysis.', variant: 'destructive' });
            return;
        }

        startTransition(async () => {
            try {
                const analysisInput = {
                    businessType,
                    transactions: transactions.map(t => ({ name: t.name, amount: t.amount, date: t.date })),
                };
                const result = await getAIFinancialAnalysis(analysisInput);
                setAiFinancialAnalysis(result as any);
                toast({ title: 'Analysis Complete!', description: 'Your financial insights are ready.' });
            } catch (error) {
                const err = error as Error;
                toast({ title: 'Analysis Failed', description: err.message, variant: 'destructive' });
            }
        });
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Financial Advisor</h1>
                    <p className="text-muted-foreground">Get actionable insights from your transaction data.</p>
                </div>
                 <Badge variant="secondary" className="gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Pro Feature
                </Badge>
            </div>
            
            <PlanGate required="pro">
                <Card>
                    <CardHeader>
                        <CardTitle>Run New Analysis</CardTitle>
                        <CardDescription>Describe your business to get tailored tax and savings advice.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <Label htmlFor="businessType">Business Type</Label>
                            <Input
                                id="businessType"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                placeholder="e.g., E-commerce Store, Freelance Developer"
                            />
                        </div>
                        <div className="self-end">
                            <Button onClick={handleAnalysis} disabled={isPending} className="w-full">
                                {isPending ? <LoadingSpinner /> : 'Analyze My Finances'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {isPending && <LoadingSpinner />}

                {initialAnalysis && !isPending && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Spending Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{initialAnalysis.spendingSummary}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Savings Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {initialAnalysis.savingsSuggestions.map((suggestion, index) => (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger>{suggestion.title}</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="mb-2">{suggestion.suggestion}</p>
                                                <div className="text-xs text-muted-foreground">
                                                    Related transactions: {suggestion.relatedTransactions.join(', ')}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5" /> Potential Tax Deductions</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Transaction</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {initialAnalysis.potentialDeductions.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.transactionName}</TableCell>
                                                <TableCell>{item.transactionDate}</TableCell>
                                                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(item.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 border rounded-lg bg-background">
                            <AlertTriangle className="h-4 w-4" />
                            {initialAnalysis.disclaimer}
                         </div>
                    </div>
                )}
            </PlanGate>
        </div>
    );
}
