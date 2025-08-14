
"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { db } from "@/firebase/client";
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { AllocationRule } from "@/lib/types";

export default function Rules() {
  const [rules, setRules] = useState<AllocationRule[]>([]);
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [destinationType, setDestinationType] = useState("hold");
  const [destinationId, setDestinationId] = useState("");
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.uid) {
        const q = query(collection(db, "users", user.uid, "rules"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rulesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AllocationRule));
            setRules(rulesData);
        });
        return () => unsubscribe();
    }
  }, [user]);

  const totalPercentage = rules.reduce((acc, rule) => acc + (Number(rule.percentage) || 0), 0);

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
        toast({title: "Not Authenticated", variant: "destructive"});
        return;
    }
    if (!name || !percentage) {
        toast({title: "Missing Fields", description: "Please provide a name and percentage.", variant: "destructive"});
        return;
    }

    await addDoc(collection(db, "users", user.uid, "rules"), {
      name,
      percentage: Number(percentage),
      destination: { type: destinationType, id: destinationId || null }
    });

    setName("");
    setPercentage(10);
    setDestinationType("hold");
    setDestinationId("");
    toast({title: "Rule added successfully"});
  }
  
  async function deleteRule(ruleId: string) {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "rules", ruleId));
      toast({title: "Rule deleted"});
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary py-8">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Rules</CardTitle>
              <CardDescription>
                Define how your incoming funds should be split. The total percentage of all rules cannot exceed 100%.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addRule} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end mb-6">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input id="name" placeholder="e.g., Taxes" value={name} onChange={e => setName(e.target.value)} />
                </div>
                 <div className="grid gap-1.5">
                  <Label htmlFor="percentage">Percentage</Label>
                  <Input id="percentage" placeholder="15" type="number" value={percentage} onChange={e => setPercentage(Number(e.target.value))} />
                </div>
                 <div className="grid gap-1.5">
                  <Label htmlFor="destType">Destination</Label>
                  <Select value={destinationType} onValueChange={setDestinationType}>
                      <SelectTrigger id="destType">
                          <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="hold">Hold (Virtual Account)</SelectItem>
                          <SelectItem value="connected_account">Stripe Connected Account</SelectItem>
                          <SelectItem value="external">External Bank (Payout)</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="destId">Destination ID</Label>
                  <Input id="destId" placeholder="acct_... or token" value={destinationId} onChange={e => setDestinationId(e.target.value)} disabled={destinationType === 'hold'} />
                </div>
                <Button type="submit" className="w-full lg:col-span-4">Add Rule</Button>
              </form>

              <div className="border rounded-lg">
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
                        {rules.map(rule => (
                            <TableRow key={rule.id}>
                                <TableCell className="font-medium">{rule.name}</TableCell>
                                <TableCell className="text-right">{rule.percentage}%</TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {rule.destination?.type ?? 'hold'}
                                    {rule.destination?.id && ` (${rule.destination.id})`}
                                </TableCell>
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
      </main>
      <Footer />
    </div>
  );
}
