"use client";

import React, { useCallback, useMemo, useState } from "react";

// Dynamic import so server action code never ends up in the client bundle.
async function runExport(opts: {
  sinceDays?: number;
  includeSends?: boolean;
  sendsLimitPerCampaign?: number;
}) {
  const mod = await import("@/app/actions/export-campaign-data");
  return mod.exportCampaignData(opts);
}

type Metrics = { sent?: number; opened?: number; clicked?: number };
type ExportRow = {
  id: string;
  name?: string;
  status?: string;
  createdAt?: any;
  metrics?: Metrics;
  sends?: any[];
};
type ExportResult = {
  generatedAt: string;
  count: number;
  campaigns: ExportRow[];
};