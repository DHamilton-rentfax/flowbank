
"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useApp } from "@/contexts/app-provider";
import PlanGate from "@/components/PlanGate";
import { getAISuggestion, getAnalyticsSnapshot, createPortalSession } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";


function Stat({ title, value }: { title: string, value: string }) {
  return (
    <div className="p-4 border rounded-2xl">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const { userPlan, analyticsSnapshot, setAnalyticsSnapshot, aiSuggestion, setAiSuggestion } = useApp();
  const { idToken } = useAuth();
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  React.useEffect(()=>{ 
    async function fetchData() {
        if (idToken) {
          const snap = await getAnalyticsSnapshot(null);
          setAnalyticsSnapshot(snap);
        }
    }
    fetchData();
  },[idToken, setAnalyticsSnapshot]);

  async function getAi() {
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
        const { url } = await createPortalSession();
        if (url) {
            window.location.href = url;
        } else {
            throw new Error("Could not create a portal session.");
        }
    } catch (e) {
        const error = e as Error;
        toast({ title: "Billing Error", description: error.message, variant: "destructive" });
    } finally {
        setIsPortalLoading(false);
    }
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

      <PlanGate plan={userPlan?.id || 'free'} required="pro">
        <section className="border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">AI Allocation Suggestions</h3>
            <button onClick={getAi} className="px-3 py-1 rounded bg-black text-white">Generate</button>
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
