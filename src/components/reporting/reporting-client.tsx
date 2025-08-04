
"use client";

import { useApp } from "@/contexts/app-provider";
import { AllocationPieChart } from "./allocation-pie-chart";
import { AllocationHistoryChart } from "./allocation-history-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "../ui/badge";

export function ReportingClient() {
  const { rules, transactions } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Reporting</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <AllocationPieChart rules={rules} />
        </div>
        <div className="lg:col-span-3">
          <AllocationHistoryChart transactions={transactions} rules={rules} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Full Transaction History</CardTitle>
          <CardDescription>
            A detailed log of all income allocations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Allocations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-accent">
                      {formatCurrency(tx.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tx.allocations.map((alloc) => {
                          const rule = rules.find(
                            (r) => r.id === alloc.ruleId
                          );
                          return (
                            <Badge variant="secondary" key={alloc.ruleId}>
                              {rule?.name}: {formatCurrency(alloc.amount)}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No transactions to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
