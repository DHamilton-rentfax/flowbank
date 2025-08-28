"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase/client";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  query,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import PlanGate from "@/components/PlanGate";
import type { AllocationRule } from "@/lib/types";

export default function RulesPage() {
  const [rules, setRules] = useState<AllocationRule[]>([]);
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState<number>(10);
  const [destinationType, setDestinationType] = useState<"hold" | "connected_account" | "external">("hold");
  const [destinationId, setDestinationId] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "users", user.uid, "rules"));
    const unsub = onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as AllocationRule));
      setRules(next);
    });
    return () => unsub();
  }, [user?.uid]);

  const totalPercentage = rules.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return toast({ title: "Not authenticated", variant: "destructive" });
    if (!name || Number.isNaN(Number(percentage))) {
      return toast({ title: "Missing fields", description: "Name and percentage required.", variant: "destructive" });
    }
    if (percentage < 0 || percentage > 100) {
      return toast({ title: "Invalid percentage", description: "Use 0–100.", variant: "destructive" });
    }
    await addDoc(collection(db, "users", user.uid, "rules"), {
      name,
      percentage: Number(percentage),
      destination: {
        type: destinationType,
        id: destinationType === "hold" ? null : destinationId || null,
      },
    });
    setName(""); setPercentage(10); setDestinationType("hold"); setDestinationId("");
    toast({ title: "Rule added successfully" });
  }

  async function deleteRule(ruleId: string) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "rules", ruleId));
    toast({ title: "Rule deleted" });
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <PlanGate required="pro">
        <Card>
          <CardHeader>
            <CardTitle>Allocation Rules</CardTitle>
            <CardDescription>
              Define how incoming funds are split. The total of all rules must be ≤ 100%.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={addRule} className="mb-6 grid items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Rule Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Taxes" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="percentage">Percentage</Label>
                <Input id="percentage" type="number" min={0} max={100} value={percentage}
                       onChange={(e) => setPercentage(Number(e.target.value))} placeholder="15" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="destType">Destination</Label>
                <Select value={destinationType} onValueChange={(v) => setDestinationType(v as any)}>
                  <SelectTrigger id="destType"><SelectValue placeholder="Select destination" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hold">Hold (Virtual Account)</SelectItem>
                    <SelectItem value="connected_account">Stripe Connected Account</SelectItem>
                    <SelectItem value="external">External Bank (Payout)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="destId">Destination ID</Label>
                <Input id="destId" value={destinationId} onChange={(e) => setDestinationId(e.target.value)}
                       placeholder="acct_... or token" disabled={destinationType === "hold"} />
              </div>
              <Button type="submit" className="w-full lg:col-span-4">Add Rule</Button>
            </form>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right">{r.percentage}%</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.destination?.type ?? "hold"}{r.destination?.id && ` (${r.destination.id})`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteRule(r.id!)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          <CardFooter className="justify-between rounded-b-lg bg-muted/50 p-4">
            <span className="font-medium">Total Allocated</span>
            <span className={`font-bold ${totalPercentage > 100 ? "text-destructive" : ""}`}>
              {totalPercentage}%
            </span>
          </CardFooter>
        </Card>
      </PlanGate>
    </div>
  );
}
