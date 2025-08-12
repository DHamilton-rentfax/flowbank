
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { seedStagingData } from '@/app/actions';
import { Loader2 } from 'lucide-react';

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
      const res: any = await seedStagingData(companyName, ownerEmail, managerEmail, overwrite);
      setOut(res);
       toast({
        title: "Seeding Complete!",
        description: `Successfully seeded data for ${res.companyId}`,
        className: "bg-accent text-accent-foreground",
      });
    } catch (e: any) {
      toast({
        title: "Seeding Failed",
        description: e.message || 'An unknown error occurred.',
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Staging Data</CardTitle>
        <CardDescription>
          Use this tool to populate the database with realistic demo data for a new company.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="ownerEmail">Owner Email</Label>
            <Input id="ownerEmail" value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)} />
        </div>
         <div className="grid gap-2">
            <Label htmlFor="managerEmail">Manager Email</Label>
            <Input id="managerEmail" value={managerEmail} onChange={e=>setManagerEmail(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="overwrite" checked={overwrite} onCheckedChange={(checked) => setOverwrite(Boolean(checked))} />
          <Label htmlFor="overwrite">
            Overwrite existing company (by slug)
          </Label>
        </div>
        {out && (
          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
            {JSON.stringify(out, null, 2)}
          </pre>
        )}
      </CardContent>
      <CardFooter>
        <Button disabled={busy} onClick={run}>
          {busy ? <Loader2 className="mr-2 animate-spin" /> : null}
          {busy ? 'Seeding…' : 'Run Seed'}
        </Button>
      </CardFooter>
    </Card>
  );
}
