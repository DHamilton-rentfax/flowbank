
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Account } from "@/lib/types";

interface GoalFormProps {
  children: React.ReactNode;
  onSetGoal: (name: string, targetAmount: number) => void;
  account: Account;
}

export function GoalForm({ children, onSetGoal, account }: GoalFormProps) {
  const [name, setName] = useState(account.goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(
    account.goal?.targetAmount.toString() || ""
  );
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(targetAmount);
    if (!name || isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid goal name and a positive target amount.",
        variant: "destructive",
      });
      return;
    }
    onSetGoal(name, numericAmount);
    toast({
      title: "Goal Set!",
      description: `Your goal for the "${account.name}" account has been saved.`,
      className: "bg-accent text-accent-foreground",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Goal for "{account.name}"</DialogTitle>
            <DialogDescription>
              Define a savings or budget goal for this account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Goal Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 'New Laptop'"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetAmount" className="text-right">
                Target Amount
              </Label>
              <Input
                id="targetAmount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="col-span-3"
                placeholder="e.g., '1500'"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="submit">Save Goal</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
