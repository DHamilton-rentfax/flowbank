
"use client";

import { useApp } from "@/contexts/app-provider";
import { ReportingClient } from "@/components/reporting/reporting-client";

export default function ReportingPage() {
  const { loadingData } = useApp();
  
  if (loadingData) {
    return <div>Loading report...</div>
  }

  return <ReportingClient />;
}
