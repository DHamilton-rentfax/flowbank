
import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/contexts/app-provider";
import { Badge } from "../ui/badge";

export function RecentAllocations() {
  const { rules, transactions } = useApp();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Allocations</CardTitle>
        <CardDescription>
          A log of your most recent income allocations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total Income</TableHead>
                <TableHead className="text-right">Allocations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.slice(0, 10).map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(tx.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {tx.allocations.map((alloc) => {
                          const rule = rules.find((r) => r.id === alloc.ruleId);
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
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No allocations yet. Add some income to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
