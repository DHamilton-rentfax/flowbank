
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { getCronRunHistory } from "@/app/actions/get-cron-run-history";
import { sendCampaignDigest } from "@/app/actions/send-campaign-digest";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { CronRun } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

export default function CronHistoryPage() {
  const [runs, setRuns] = useState<CronRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const { runs: fetchedRuns } = await getCronRunHistory();
        setRuns(fetchedRuns);
      } catch (error) {
        const err = error as Error;
        toast({
          title: "Error fetching history",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [toast]);
  
  const handleManualRun = () => {
    startTransition(async () => {
        try {
            const result = await sendCampaignDigest();
            if (result.success) {
                toast({ title: "Digest sent!", description: "The campaign digest has been successfully sent."});
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            const err = error as Error;
            toast({ title: "Failed to send digest", description: err.message, variant: "destructive"});
        }
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary py-8">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Cron Job Run History</CardTitle>
                        <CardDescription>
                            Showing the last 100 executions of scheduled jobs.
                        </CardDescription>
                    </div>
                    <Button onClick={handleManualRun} disabled={isPending}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {isPending ? 'Sending...' : 'Run Campaign Digest Now'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Triggered By</TableHead>
                      <TableHead className="text-right">Run Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-28" /></TableCell>
                        </TableRow>
                      ))
                    ) : runs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No job history found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      runs.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">{run.job}</TableCell>
                          <TableCell>
                            <Badge variant={run.success ? "default" : "destructive"} className={cn(run.success && 'bg-green-600')}>
                              {run.success ? "Success" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{run.triggeredBy}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {format(new Date(run.runAt), "PPP p")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    