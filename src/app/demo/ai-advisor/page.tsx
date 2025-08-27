// src/app/demo/ai-advisor/page.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Bot, TrendingUp, ReceiptText, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const sampleAnalysis = {
    spendingSummary: "Your top spending categories this month are Marketing ($1,250) and SaaS Subscriptions ($210). We've identified two recurring subscriptions for similar design software, which could be an area for savings.",
    savingsSuggestions: [
      { title: 'Consolidate Design Subscriptions', suggestion: 'You are subscribed to both Figma ($15/mo) and Sketch ($9/mo). Consolidating to one could save you at least $108 per year.', relatedTransactions: ['Figma', 'Sketch'] },
      { title: 'Switch Vercel to Annual Billing', suggestion: 'You can save 20% on your Vercel hosting costs by switching from a monthly to an annual plan.', relatedTransactions: ['Vercel Inc.'] },
    ],
    potentialDeductions: [
      { transactionName: 'Google Ads', transactionDate: '2024-07-26', amount: 150.00, category: 'Marketing', reason: 'Advertising costs for your business are typically fully deductible.' },
      { transactionName: 'Vercel Inc.', transactionDate: '2024-07-27', amount: 20.00, category: 'Software/Hosting', reason: 'Hosting and infrastructure costs are considered operational expenses and are deductible.' },
    ],
    disclaimer: 'I am an AI assistant. Please consult a qualified professional for official financial advice.',
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function DemoAiAdvisorPage() {
    const [businessType, setBusinessType] = useState('SaaS Platform');
    const [isPending, setIsPending] = useState(false);
    const [analysis, setAnalysis] = useState<typeof sampleAnalysis | null>(null);

    const handleAnalysis = () => {
        setIsPending(true);
        toast.info("Generating AI Insights...", { description: "This can take a moment." });
        setTimeout(() => {
            setAnalysis(sampleAnalysis);
            setIsPending(false);
            toast.success("Analysis Complete!", { description: "Your financial insights are ready." });
        }, 1500); // Simulate network delay
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Financial Advisor</h1>
                    <p className="text-muted-foreground">Get actionable insights from your transaction data.</p>
                </div>
            </div>
            
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

            {analysis && !isPending && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Spending Summary</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">{analysis.spendingSummary}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Savings Suggestions</CardTitle></CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {analysis.savingsSuggestions.map((suggestion, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>{suggestion.title}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="mb-2">{suggestion.suggestion}</p>
                                            <div className="text-xs text-muted-foreground">Related transactions: {suggestion.relatedTransactions.join(', ')}</div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5" /> Potential Tax Deductions</CardTitle></CardHeader>
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
                                    {analysis.potentialDeductions.map((item, index) => (
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
                        {analysis.disclaimer}
                     </div>
                </div>
            )}
        </div>
    );
}
