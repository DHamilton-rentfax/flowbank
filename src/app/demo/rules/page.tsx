// src/app/demo/rules/page.tsx
"use client";

import React, { useState } from "react";
import { useDemo } from "@/contexts/demo-provider";
import { produce } from "immer";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { AllocationRule } from "@/lib/types";

export default function DemoRulesPage() {
  const { rules, setRules } = useDemo();
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState<number | string>(10);

  const totalPercentage = rules.reduce((acc, rule) => acc + (Number(rule.percentage) || 0), 0);

  function addRule(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !percentage) {
        toast.error("Missing Fields", { description: "Please provide a name and percentage." });
        return;
    }
    if (totalPercentage + Number(percentage) > 100) {
        toast.error("Cannot Exceed 100%", { description: "Total allocation percentage cannot be more than 100." });
        return;
    }

    const newRule: AllocationRule = {
      id: `demo_${Date.now()}`,
      name,
      percentage: Number(percentage),
      destination: { type: 'hold', id: name.toLowerCase().replace(/ /g, '_') }
    };
    
    setRules(produce(rules, draft => {
        draft.push(newRule);
    }));

    setName("");
    setPercentage(10);
    toast.success("Rule added successfully");
  }
  
  function deleteRule(ruleId: string) {
      setRules(produce(rules, draft => {
          return draft.filter(rule => rule.id !== ruleId);
      }));
      toast.info("Rule deleted");
  }

  return (
    <div className="max-w-3xl mx-auto">
        <Card>
            <CardHeader>
            <CardTitle>Allocation Rules</CardTitle>
            <CardDescription>
                Define how your incoming funds should be split. The total percentage of all rules cannot exceed 100%.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={addRule} className="grid gap-4 md:grid-cols-3 items-end mb-6">
                <div className="grid gap-1.5">
                <Label htmlFor="name">Rule Name</Label>
                <Input id="name" placeholder="e.g., Taxes" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                <Label htmlFor="percentage">Percentage</Label>
                <Input id="percentage" placeholder="15" type="number" value={percentage} onChange={e => setPercentage(e.target.value)} />
                </div>
                <Button type="submit" className="w-full md:w-auto">Add Rule</Button>
            </form>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map(rule => (
                            <TableRow key={rule.id}>
                                <TableCell className="font-medium">{rule.name}</TableCell>
                                <TableCell className="text-right">{rule.percentage}%</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            </CardContent>
            <CardFooter className="justify-between bg-muted/50 p-4 rounded-b-lg">
                <span className="font-medium">Total Allocated</span>
                <span className={`font-bold ${totalPercentage > 100 ? 'text-destructive' : ''}`}>{totalPercentage}%</span>
            </CardFooter>
        </Card>
    </div>
  );
}
