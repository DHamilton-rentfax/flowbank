"use client";

import type { AllocationRule, Transaction } from "@/lib/types";
import { useMemo } from "react";
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
    const data: { [key: string]: number | string }[] = transactions
      .map((tx) => {
        const entry: { [key: string]: number | string } = {
          date: new Date(tx.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
        tx.allocations.forEach((alloc) => {
          const rule = rules.find((r) => r.id === alloc.ruleId);
          if (rule) {
            entry[rule.name] = alloc.amount;
          }
        });
        return entry;
      })
      .reverse();

    const config = rules.reduce((acc, rule, index) => {
      acc[rule.name] = {
        label: rule.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return acc;
    }, {} as ChartConfig);

    return { chartData: data, chartConfig: config };
  }, [transactions, rules]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation History</CardTitle>
        <CardDescription>
          Total amounts allocated from each income event.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
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
              content={<ChartTooltipContent formatter={formatCurrency} />}
            />
            {rules.map((rule, index) => (
              <Bar
                key={rule.id}
                dataKey={rule.name}
                stackId="a"
                fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
