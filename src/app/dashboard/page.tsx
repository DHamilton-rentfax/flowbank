
"use client";

import React, { useState, useTransition } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useApp } from "@/contexts/app-provider";
import PlanGate from "@/components/PlanGate";
import { getAISuggestion, getAnalyticsSnapshot, createPortalSession, getAIFinancialAnalysis, syncAllTransactions } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wallet, Lightbulb, Sparkles, RefreshCw } from "lucide-react";
import { AnalyzeTransactionsOutput } from "@/ai/flows/analyze-transactions";
import Link from "next/link";
import { format, parseISO } from 'date-fns';

function Stat({ title, value }: { title: string, value: string }) {
  return (
    <div className="p-4 border rounded-2xl">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function AIFinancialAdvisor() {
  const { toast } = useToast();
  const { transactions, aiFinancialAnalysis } = useApp();
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
                          {aiFinancialAnalysis.potentialDeductions.map((item, index) => (
                            <li key={index} className="p-3 bg-secondary rounded-lg">
                              <p className="font-semibold">{item.transactionName} - <span className="font-mono">${item.amount.toFixed(2)}</span></p>
                              <p className="text-sm text-muted-foreground">{item.reason}</p>
                            </li>
                          ))}
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
                          {aiFinancialAnalysis.savingsSuggestions.map((item, index) => (
                            <li key={index} className="p-3 bg-secondary rounded-lg">
                              <p className="font-semibold">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                            </li>
                          ))}
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
  const { idToken } = useAuth();
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  React.useEffect(()=>{ 
    async function fetchData() {
        if (idToken) {
          // No need to sync here, webhooks will handle it
          // await syncAllTransactions();
          const snap = await getAnalyticsSnapshot(null);
          setAnalyticsSnapshot(snap);
        }
    }
    fetchData();
  },[idToken, setAnalyticsSnapshot]);

  async function getAiAllocation() {
    try {
        const { plan } = await getAISuggestion("Software business"); // Using a default for now
        if (plan) {
            setAiSuggestion(plan);
            toast({ title: "AI Suggestion", description: "New allocation plan suggested." });
        }
    } catch (e) {
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

  if (loadingData) {
    return <div className="text-center p-8">Loading dashboard...</div>
  }

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

      <section className="border rounded-2xl p-4">
        <h3 className="font-bold mb-2">Income & Expenses</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsSnapshot?.series||[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#82ca9d" />
              <Line type="monotone" dataKey="expenses" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {hasPlaidLinked && !hasAIFeature && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Unlock AI Financial Insights</CardTitle>
                <CardDescription>Try our AI Financial Advisor for personalized deduction detection and savings advice.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
              <Button asChild>
                <Link href="/pricing">Upgrade to Unlock</Link>
              </Button>
          </CardContent>
        </Card>
      )}

      {hasPlaidLinked && hasAIFeature && (
         <PlanGate feature="aiTaxCoach">
            <AIFinancialAdvisor />
         </PlanGate>
      )}
      
       <PlanGate required="pro">
        <section className="border rounded-2xl p-4">
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
