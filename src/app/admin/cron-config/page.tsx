
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

const presets = [
  { label: "Daily @ 9am UTC", value: "0 9 * * *" },
  { label: "Weekly on Monday", value: "0 9 * * 1" },
  { label: "Every 6 Hours", value: "0 */6 * * *" },
  { label: "Every 15 Minutes", value: "*/15 * * * *" },
];

export default function CronConfigPage() {
  const [cron, setCron] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [nextRun, setNextRun] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const { cron: fetchedCron } = await getCronConfig();
        setCron(fetchedCron);
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
        const result = await saveCronConfig(cron);
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
                        {loading ? <Skeleton className="h-24" /> : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="cron-input">Cron Expression</Label>
                                    <Input 
                                        id="cron-input"
                                        value={cron}
                                        onChange={(e) => setCron(e.target.value)}
                                        className="font-mono"
                                        placeholder="0 9 * * *"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Next scheduled run (local time): <span className="font-semibold">{nextRun}</span>
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
