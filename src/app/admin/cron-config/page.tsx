
"use client";

import { useEffect, useState, useTransition } from "react";
import { getCronConfig, saveCronConfig } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const presets = [
  { label: "Daily @ 9am UTC", value: "0 9 * * *" },
  { label: "Weekly on Monday", value: "0 9 * * 1" },
  { label: "Every 6 Hours", value: "0 */6 * * *" },
  { label: "Every 15 Minutes", value: "*/15 * * * *" },
];

export default function CronConfigPage() {
  const [cron, setCron] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [nextRun, setNextRun] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const { cron: fetchedCron, enabled } = await getCronConfig();
        setCron(fetchedCron);
        setIsEnabled(enabled);
      } catch (error) {
        const err = error as Error;
        toast({ title: "Error", description: `Could not load config: ${err.message}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [toast]);

  useEffect(() => {
    if (!cron) return;
    import("cron-parser").then(({ default: parser }) => {
      try {
        const interval = parser.parseExpression(cron);
        setNextRun(interval.next().toString());
      } catch (err) {
        setNextRun("Invalid expression");
      }
    });
  }, [cron]);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await saveCronConfig(cron, isEnabled);
        if (result.success) {
          toast({ title: "Success!", description: result.message });
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const err = error as Error;
        toast({ title: "Error saving config", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-secondary py-8">
            <div className="container mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Cron Job Settings</CardTitle>
                        <CardDescription>
                            Configure the schedule for the automated AI Campaign Digest email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loading ? <Skeleton className="h-40" /> : (
                            <>
                                <div className="flex items-center space-x-2">
                                    <Switch id="cron-enabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
                                    <Label htmlFor="cron-enabled" className="text-base">
                                        {isEnabled ? "Digest Enabled" : "Digest Paused"}
                                    </Label>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cron-input">Cron Expression</Label>
                                    <Input 
                                        id="cron-input"
                                        value={cron}
                                        onChange={(e) => setCron(e.target.value)}
                                        className="font-mono"
                                        placeholder="0 9 * * *"
                                        disabled={!isEnabled}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {isEnabled ? `Next scheduled run (local time): ${nextRun}` : 'Job is paused and will not run.'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Presets</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {presets.map(p => (
                                            <Button
                                                key={p.value}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCron(p.value)}
                                                disabled={!isEnabled}
                                            >
                                                {p.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSave} disabled={isPending || loading}>
                            {isPending ? "Saving..." : "Save Configuration"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
