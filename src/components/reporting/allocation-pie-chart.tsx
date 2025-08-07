
"use client";

import type { AllocationRule } from "@/lib/types";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

interface AllocationPieChartProps {
  rules: AllocationRule[];
}

export function AllocationPieChart({ rules }: AllocationPieChartProps) {
  const chartData = rules.map((rule) => ({
    name: rule.name,
    value: rule.percentage,
    fill: `hsl(var(--chart-${(rules.indexOf(rule) % 5) + 1}))`,
  }));

  const chartConfig = rules.reduce((acc, rule, index) => {
    acc[rule.name] = {
      label: rule.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation Breakdown</CardTitle>
        <CardDescription>
          Your current allocation rule percentages.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
