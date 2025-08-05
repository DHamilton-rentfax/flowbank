
"use client";

import type { AllocationRule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle, Save, Zap } from "lucide-react";
import { nanoid } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { useApp } from "@/contexts/app-provider";
import Link from "next/link";

interface AllocationRulesProps {
  rules: AllocationRule[];
  setRules: (rules: AllocationRule[]) => void;
  onSave: () => void;
}

export function AllocationRules({ rules, setRules, onSave }: AllocationRulesProps) {
  const { toast } = useToast();
  const { userPlan } = useApp();
  const totalPercentage = rules.reduce((sum, rule) => sum + Number(rule.percentage || 0), 0);

  const isFreePlan = userPlan?.id === 'free';
  const ruleLimit = 3;
  const canAddMoreRules = !isFreePlan || rules.length < ruleLimit;


  const handleAddRule = () => {
    if (!canAddMoreRules) {
       toast({
        title: "Rule Limit Reached",
        description: "Upgrade to a Pro plan to add more allocation rules.",
        variant: "destructive",
      });
      return;
    }
    setRules([...rules, { id: nanoid(), name: "", percentage: 0 }]);
  };

  const handleRemoveRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleRuleChange = (id: string, field: "name" | "percentage", value: string) => {
    const newRules = rules.map((rule) => {
      if (rule.id === id) {
        return { ...rule, [field]: field === "percentage" ? parseFloat(value) || 0 : value };
      }
      return rule;
    });
    setRules(newRules);
  };

  const handleSaveClick = () => {
    if (totalPercentage !== 100) {
      toast({
        title: "Invalid Percentages",
        description: `Total percentage must be 100%. Current total is ${totalPercentage}%.`,
        variant: "destructive",
      });
      return;
    }
    onSave();
    toast({
      title: "Rules Saved",
      description: "Your new allocation rules have been saved.",
      className: "bg-accent text-accent-foreground",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation Rules</CardTitle>
        <CardDescription>
          Define how your income is divided. Percentages must add up to 100.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.map((rule, index) => (
          <div key={rule.id} className="flex items-center gap-2">
            <Input
              placeholder={`Rule #${index + 1}`}
              value={rule.name}
              onChange={(e) => handleRuleChange(rule.id, "name", e.target.value)}
              className="flex-grow"
            />
            <div className="relative w-28">
              <Input
                type="number"
                placeholder="0"
                value={rule.percentage}
                onChange={(e) => handleRuleChange(rule.id, "percentage", e.target.value)}
                className="pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
         <Button variant="outline" onClick={handleAddRule} className="w-full" disabled={!canAddMoreRules}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Rule
        </Button>
        {!canAddMoreRules && (
            <div className="text-center text-sm text-muted-foreground p-4 rounded-md border border-dashed">
                <p className="font-medium">You've reached the {ruleLimit}-rule limit for the Free plan.</p>
                <Button size="sm" variant="link" asChild>
                    <Link href="/pricing">
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade to Pro for unlimited rules
                    </Link>
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          <Badge variant={totalPercentage === 100 ? "default" : "destructive"} className={totalPercentage === 100 ? "bg-accent" : ""}>
              Total: {totalPercentage}%
          </Badge>
        </div>
        <Button onClick={handleSaveClick}>
          <Save className="mr-2 h-4 w-4" /> Save Rules
        </Button>
      </CardFooter>
    </Card>
  );
}
