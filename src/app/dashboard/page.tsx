
"use client";

import React, { useState, useTransition, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useApp } from "@/contexts/app-provider";
import PlanGate from "@/components/PlanGate";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wallet, Lightbulb, Sparkles, RefreshCw } from "lucide-react";
import { AnalyzeTransactionsOutput } from "@/ai/flows/analyze-transactions";
import Link from "next/link";
import { format, parseISO } from 'date-fns';
import { getAnalyticsSnapshot } from "@/app/actions/get-analytics-snapshot";
import { getAISuggestion } from "@/app/actions/get-ai-suggestion";
import { getAIFinancialAnalysis } from "@/app/actions/get-ai-financial-analysis";
import { createPortalSession } from "@/app/actions/create-portal-session";

function Stat({ title, value }: { title: string, value: string }) {
  return (
    <div className="p-4 border rounded-2xl bg-background">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function AIFinancialAdvisor() {
  const { toast } = useToast();
  const { transactions, aiFinancialAnalysis, userPlan, features } = useApp();
  const [isAnalysisLoading, startTransition] = useTransition();

  async function handleFinancialAnalysis() {
    if (!transactions || transactions.length === 0) {
      toast({ title: "No Transactions", description: "Sync your bank account to analyze transactions.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        await getAIFinancialAnalysis({
          businessType: "Software Freelancer", // This could be dynamic
          transactions: transactions.slice(0, 100).map(t => ({ name: t.name, amount: t.amount, date: t.date }))
        });
        toast({ title: "Analysis Refresh Complete", description: "Your financial insights have been updated." });
      } catch (e) {
        const error = e as Error;
        toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
      }
    });
  }

  const lastAnalyzed = aiFinancialAnalysis?.analyzedAt ? format(parseISO(aiFinancialAnalysis.analyzedAt), "PPP p") : "Never";
  const planName = userPlan?.id || 'free';
  const hasAIFeature = features?.aiTaxCoach === true;


  return (
     <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>AI Financial Advisor</CardTitle>
                <CardDescription>Insights from your recent transactions. Last analyzed: {lastAnalyzed}</CardDescription>
              </div>
              <Button onClick={handleFinancialAnalysis} disabled={isAnalysisLoading} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isAnalysisLoading ? 'animate-spin' : ''}`} />
                  {isAnalysisLoading ? "Analyzing..." : "Refresh"}
              </Button>
            </div>
        </CardHeader>
        <CardContent>
            {!aiFinancialAnalysis ? (
                 <div className="text-center py-8 text-muted-foreground">
                    <p>No financial analysis available yet.</p>
                    <p className="text-sm">Connect your bank and sync transactions, or click "Refresh".</p>
                </div>
            ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{aiFinancialAnalysis.spendingSummary}</p>
                  
                  <Accordion type="single" collapsible className="w-full" defaultValue="deductions">
                    <AccordionItem value="deductions">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-primary" />
                          Potential Tax Deductions ({aiFinancialAnalysis.potentialDeductions.length})
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 pt-2">
                          {aiFinancialAnalysis.potentialDeductions.slice(0, !hasAIFeature && planName === 'free' ? 3 : undefined).map((item, index) => (
                            <li key={index} className="p-3 bg-secondary rounded-lg">
                              <p className="font-semibold">{item.transactionName} - <span className="font-mono">${item.amount.toFixed(2)}</span></p>
                              <p className="text-sm text-muted-foreground">{item.reason}</p>
                            </li>
                          ))}
                           {!hasAIFeature && planName === 'free' && aiFinancialAnalysis.potentialDeductions.length > 3 && (
                            <li className="text-center p-4 text-sm">
                                <Button variant="secondary" asChild>
                                    <Link href="/pricing">Upgrade to see all {aiFinancialAnalysis.potentialDeductions.length} potential deductions</Link>
                                </Button>
                            </li>
                          )}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="savings">
                       <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-amber-500" />
                          Savings Suggestions ({aiFinancialAnalysis.savingsSuggestions.length})
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                          <ul className="space-y-2 pt-2">
                            {aiFinancialAnalysis.savingsSuggestions.slice(0, !hasAIFeature && planName === 'free' ? 2 : undefined).map((item, index) => (
                                <li key={index} className="p-3 bg-secondary rounded-lg">
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                                </li>
                            ))}
                            {!hasAIFeature && planName === 'free' && aiFinancialAnalysis.savingsSuggestions.length > 2 && (
                                <li className="text-center p-4 text-sm">
                                    <Button variant="secondary" asChild>
                                        <Link href="/pricing">Upgrade for more savings insights</Link>
                                    </Button>
                                </li>
                            )}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <p className="text-xs text-center text-muted-foreground italic pt-4">{aiFinancialAnalysis.disclaimer}</p>
                </div>
            )}
        </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { toast } = useToast();
  const { analyticsSnapshot, setAnalyticsSnapshot, aiSuggestion, setAiSuggestion, transactions, userPlan, features, loadingData } = useApp();
  const { user } = useAuth();
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(()=>{ 
    async function fetchData() {
        if (user && !loadingData) {
          const snap = await getAnalyticsSnapshot(null);
          setAnalyticsSnapshot(snap);
        }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user, loadingData]);

  async function getAiAllocation() {
    try {
        const { plan } = await getAISuggestion("Software business"); // Using a default for now
        if (plan) {
            setAiSuggestion(plan);
            toast({ title: "AI Suggestion", description: "New allocation plan suggested." });
        }
    } catch (e) {
        const error = e as Error;
        toast({ title: "Error", description: "Could not get AI suggestion.", variant: "destructive" });
    }
  }

  async function openPortal() {
    setIsPortalLoading(true);
    try {
        const { url, error } = await createPortalSession();
        if (url) {
            window.location.href = url;
        } else {
            throw new Error(error || "Could not create a portal session.");
        }
    } catch (e) {
        const error = e as Error;
        toast({ title: "Billing Error", description: error.message, variant: "destructive" });
    } finally {
        setIsPortalLoading(false);
    }
  }
  
  const hasPlaidLinked = transactions.length > 0;
  const hasAIFeature = features?.aiTaxCoach === true;
  const planName = userPlan?.id || 'free';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
       <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Button onClick={openPortal} disabled={isPortalLoading}>
                {isPortalLoading ? "Opening..." : "Manage Billing"}
            </Button>
        </div>

      <section className="grid md:grid-cols-3 gap-4">
        <Stat title="Income (30d)" value={"$"+(analyticsSnapshot?.income?.toFixed?.(2)||"0.00")} />
        <Stat title="Expenses (30d)" value={"$"+(analyticsSnapshot?.expenses?.toFixed?.(2)||"0.00")} />
        <Stat title="Net (30d)" value={"$"+(analyticsSnapshot?.net?.toFixed?.(2)||"0.00")} />
      </section>

      <section className="border rounded-2xl p-4 bg-background">
        <h3 className="font-bold mb-2">Income & Expenses (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsSnapshot?.series||[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border p-2 rounded-lg shadow-sm">
                        <p className="font-bold">{label}</p>
                        <p className="text-green-600">Income: ${payload[0].value?.toFixed(2)}</p>
                        <p className="text-red-600">Expenses: ${payload[1].value?.toFixed(2)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {hasPlaidLinked && !hasAIFeature && planName === 'free' &&(
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Unlock Full AI Financial Insights</CardTitle>
                <CardDescription>You are seeing a limited preview. Upgrade or add the AI enhancement to unlock the full AI Financial Advisor.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
              <Button asChild>
                <Link href="/pricing">View Plans & Add-ons</Link>
              </Button>
          </CardContent>
        </Card>
      )}

      {hasPlaidLinked && (
         <PlanGate feature="aiSuggestions">
            <AIFinancialAdvisor />
         </PlanGate>
      )}
      
       <PlanGate required="pro">
        <section className="border rounded-2xl p-4 bg-background">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">AI Allocation Suggestions</h3>
            <button onClick={getAiAllocation} className="px-3 py-1 rounded bg-black text-white">Generate</button>
          </div>
          {aiSuggestion ? (
            <ul className="grid sm:grid-cols-3 gap-2">
              {Object.entries(aiSuggestion).map(([k,v]) => (
                <li key={k} className="p-3 border rounded-lg flex items-center justify-between"><span className="capitalize">{k}</span><b>{v}%</b></li>
              ))}
            </ul>
          ) : <p className="text-sm text-neutral-600">Click Generate to get a suggested split.</p>}
        </section>
      </PlanGate>
    </div>
  );
}


    