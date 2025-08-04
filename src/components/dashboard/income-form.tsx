"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { DollarSign } from "lucide-react";

interface IncomeFormProps {
  onAddIncome: (amount: number) => void;
}

export function IncomeForm({ onAddIncome }: IncomeFormProps) {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    onAddIncome(numericAmount);
    toast({
      title: "Success!",
      description: `${formatCurrency(
        numericAmount
      )} has been allocated.`,
      className: "bg-accent text-accent-foreground",
    });
    setAmount("");
  };

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-2">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Add Income</CardTitle>
          <CardDescription>
            Enter a new deposit to automatically allocate it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">
            Allocate Funds
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
