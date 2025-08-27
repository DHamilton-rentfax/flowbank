// src/app/demo/reporting/page.tsx
"use client";

import { useDemo } from "@/contexts/demo-provider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

function aggregateData(transactions: any[]) {
    let income30 = 0;
    let expense30 = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
    const monthlyData: { [key: string]: { name: string; income: number; expenses: number } } = {};
  
    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month, income: 0, expenses: 0 };
      }
      
      if (t.isIncome) {
        monthlyData[month].income += t.amount;
        if (date > thirtyDaysAgo) income30 += t.amount;
      } else {
        monthlyData[month].expenses += Math.abs(t.amount);
        if (date > thirtyDaysAgo) expense30 += Math.abs(t.amount);
      }
    });
  
    return {
      income30,
      expense30,
      chartData: Object.values(monthlyData).reverse()
    };
}
  

export default function DemoReportingPage() {
    const { transactions } = useDemo();
    const { income30, expense30, chartData } = aggregateData(transactions);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-xl font-semibold">Reporting</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Income vs. expenses from your demo data.</p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Income (Last 30d)</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold text-green-600">{formatCurrency(income30)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Expenses (Last 30d)</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold text-red-600">{formatCurrency(expense30)}</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="income" fill="#4A90E2" name="Income" />
                            <Bar dataKey="expenses" fill="#F0F4F8" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
