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

interface RecentAllocationsProps {
  transactions: Transaction[];
}

export function RecentAllocations({ transactions }: RecentAllocationsProps) {
  const { rules } = useApp();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Allocations</CardTitle>
        <CardDescription>
          A log of your most recent income allocations.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              transactions.slice(0, 5).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-medium text-accent">
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
                <TableCell colSpan={3} className="text-center">
                  No allocations yet. Add some income to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
