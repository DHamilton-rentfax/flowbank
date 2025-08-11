
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { seedStagingData } from "@/app/actions";
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function SeedPage() {
  const [companyName, setCompanyName] = useState('FlowBank Demo Co');
  const [ownerEmail, setOwnerEmail] = useState(`owner.demo+${Date.now()}@example.com`);
  const [managerEmail, setManagerEmail] = useState(`manager.demo+${Date.now()}@example.com`);
  const [overwrite, setOverwrite] = useState(false);
  const [out, setOut] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const run = async () => {
    setBusy(true); 
    setOut(null);
    try {
      const res = await seedStagingData({ companyName, ownerEmail, managerEmail, overwrite });
      if (res.success) {
        setOut(res.details);
        toast({
            title: "Success!",
            description: res.message,
            className: "bg-accent text-accent-foreground",
        })
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      toast({
        title: "Seed Failed",
        description: e.message || 'An unknown error occurred.',
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold">Seed Staging Data</h1>
            <p className="text-muted-foreground">
                One-click tool to populate the database with realistic demo data.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Seeder Configuration</CardTitle>
                <CardDescription>Adjust the parameters for the data seeder below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Owner Email</Label>
                    <Input id="ownerEmail" value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="managerEmail">Manager Email</Label>
                    <Input id="managerEmail" value={managerEmail} onChange={e=>setManagerEmail(e.target.value)} />
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="overwrite" checked={overwrite} onCheckedChange={(checked) => setOverwrite(Boolean(checked))} />
                    <Label htmlFor="overwrite" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Overwrite existing company (by slug)
                    </Label>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                 <Button disabled={busy} onClick={run}>
                    {busy ? <Loader2 className="mr-2 animate-spin"/> : null}
                    {busy ? 'Seeding…' : 'Run seed'}
                </Button>

                {out && (
                <div className="w-full">
                    <h3 className="font-semibold mb-2">Output:</h3>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto w-full">
                        {JSON.stringify(out, null, 2)}
                    </pre>
                </div>
                )}
            </CardFooter>
        </Card>
    </div>
  );
}
