
import type { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Banknote, Trash2, Edit } from "lucide-react";
import { GoalForm } from "./goal-form";
import { useApp } from "@/contexts/app-provider";
import { Button } from "../ui/button";

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const { updateAccount } = useApp();
  const goalProgress = account.goal
    ? (account.balance / account.goal.targetAmount) * 100
    : 0;

  const handleSetGoal = (name: string, targetAmount: number) => {
    updateAccount({ ...account, goal: { name, targetAmount } });
  };
  
  const handleRemoveGoal = () => {
    const { goal, ...accountWithoutGoal } = account;
    updateAccount(accountWithoutGoal);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{account.name}</CardTitle>
        <Banknote className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
        {account.goal ? (
          <div className="mt-2 space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{account.goal.name}</span>
                <span>{formatCurrency(account.goal.targetAmount)}</span>
              </div>
              <Progress value={goalProgress} />
            </div>
             <div className="flex justify-end gap-1">
                <GoalForm onSetGoal={handleSetGoal} account={account}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                </GoalForm>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRemoveGoal}>
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex justify-end">
            <GoalForm onSetGoal={handleSetGoal} account={account}>
              <Button variant="outline" size="sm">Set Goal</Button>
            </GoalForm>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
