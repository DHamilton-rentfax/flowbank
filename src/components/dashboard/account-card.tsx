
import type { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Banknote, Goal } from "lucide-react";

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const goalProgress = account.goal
    ? (account.balance / account.goal.targetAmount) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{account.name}</CardTitle>
        <Banknote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
        {account.goal && (
            <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{account.goal.name}</span>
                    <span>{formatCurrency(account.goal.targetAmount)}</span>
                </div>
                <Progress value={goalProgress} />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
