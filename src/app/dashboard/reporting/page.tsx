
"use client";

import { useApp } from "@/contexts/app-provider";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const ReportingClient = dynamic(() => import('@/components/reporting/reporting-client').then(mod => mod.ReportingClient), {
    loading: () => (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-2"><Skeleton className="h-80 w-full" /></div>
                <div className="lg:col-span-3"><Skeleton className="h-80 w-full" /></div>
            </div>
             <Skeleton className="h-96 w-full" />
        </div>
    ),
    ssr: false
});

export default function ReportingPage() {
  const { loadingData } = useApp();
  
  if (loadingData) {
    return <div>Loading report...</div>
  }

  return <ReportingClient />;
}
