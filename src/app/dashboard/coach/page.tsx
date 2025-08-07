
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import { getAIFinancialCoach } from '@/app/actions';
import type { FinancialCoachOutput } from '@/ai/flows/financial-coach-flow';
import { Loader2, Wand2, Sparkles, PiggyBank, Briefcase, HandCoins } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function AdviceCard({ title, content, icon, isLoading }: { title: string, content: string, icon: React.ReactNode, isLoading: boolean}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {icon}
                </div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                         <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function CoachPage() {
    const { plaidTransactions } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [advice, setAdvice] = useState<FinancialCoachOutput | null>(null);
    const { toast } = useToast();

    const handleGetAnalysis = async () => {
        setIsLoading(true);
        const result = await getAIFinancialCoach({ transactions: plaidTransactions });
        setIsLoading(false);

        if (result.success && result.advice) {
            setAdvice(result.advice);
            toast({
                title: "Analysis Complete!",
                description: "Your personalized financial advice is ready.",
                className: "bg-accent text-accent-foreground"
            });
        } else {
            toast({
                title: "Analysis Failed",
                description: result.error || "Could not generate financial advice.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AI Financial Coach</h1>
                    <p className="text-muted-foreground">
                        Get personalized financial advice based on your transaction history.
                    </p>
                </div>
                <Button onClick={handleGetAnalysis} disabled={isLoading || plaidTransactions.length === 0}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                    {isLoading ? "Analyzing..." : "Get AI Analysis"}
                </Button>
            </div>
            
            {plaidTransactions.length === 0 && !isLoading && (
                 <Card className="text-center p-8 border-dashed">
                    <CardTitle>No Transaction Data</CardTitle>
                    <CardDescription className="mt-2 max-w-md mx-auto">
                        Connect your bank account and sync your transactions on the dashboard to enable the AI Coach.
                    </CardDescription>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <AdviceCard 
                    title="Spending Analysis" 
                    content={advice?.spendingAnalysis || "Click 'Get AI Analysis' to see your spending breakdown."}
                    icon={<HandCoins />}
                    isLoading={isLoading}
                />
                 <AdviceCard 
                    title="Savings Recommendations" 
                    content={advice?.savingsRecommendations || "Click 'Get AI Analysis' to get savings tips."}
                    icon={<PiggyBank />}
                    isLoading={isLoading}
                />
                 <AdviceCard 
                    title="Investment Guidance" 
                    content={advice?.investmentGuidance || "Click 'Get AI Analysis' for investment ideas."}
                    icon={<Briefcase />}
                    isLoading={isLoading}
                />
                 <AdviceCard 
                    title="Tax Best Practices" 
                    content={advice?.taxBestPractices || "Click 'Get AI Analysis' for relevant tax information."}
                    icon={<Sparkles />}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
