
"use client";

import type { AllocationRule, Transaction } from "@/lib/types";
import { useMemo }s from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

interface AllocationHistoryChartProps {
  transactions: Transaction[];
  rules: AllocationRule[];
}

export function AllocationHistoryChart({
  transactions,
  rules,
}: AllocationHistoryChartProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const totals: { [key: string]: number } = {};
    
    rules.forEach(rule => {
      totals[rule.name] = 0;
    });

    transactions.forEach(tx => {
        tx.allocations.forEach(alloc => {
            const rule = rules.find(r => r.id === alloc.ruleId);
            if (rule && totals.hasOwnProperty(rule.name)) {
                totals[rule.name] += alloc.amount;
            }
        });
    });

    const data = Object.keys(totals).map(name => ({
      name,
      total: totals[name]
    }));

    const config = rules.reduce((acc, rule, index) => {
      acc[rule.name] = {
        label: rule.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return acc;
    }, {} as ChartConfig);

    return { chartData: data, chartConfig: config };
  }, [transactions, rules]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allocation Totals</CardTitle>
          <CardDescription>
            A summary of total funds allocated to each category.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] w-full items-center justify-center">
            <p className="text-muted-foreground">No transaction data yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation Totals</CardTitle>
        <CardDescription>
          A summary of total funds allocated to each category over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(Number(value))}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
            />
            <Bar
              dataKey="total"
              radius={[4, 4, 0, 0]}
            >
               {chartData.map((entry) => (
                <Cell key={entry.name} fill={chartConfig[entry.name]?.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
