import "server-only";
import { z } from "zod";

/** ---------- Schemas & Types ---------- **/

export const TransactionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).describe("Merchant or description"),
  amount: z.number().describe("Positive for inflow, negative for outflow"),
  date: z.union([z.string(), z.date()]).describe("ISO date string or Date"),
  // Optional raw category if you have it externally (we'll also compute a heuristic category)
  category: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

const AnalyzeInputSchema = z.object({
  transactions: z.array(TransactionSchema).default([]),
});

export type AnalyzeInput = z.infer<typeof AnalyzeInputSchema>;

export type AnalyzeResult = {
  ok: true;
  summary: {
    count: number;
    totalIn: number;
    totalOut: number; // absolute sum of negatives
    net: number; // totalIn - totalOut
  };
  byMonth: Array<{
    month: string; // YYYY-MM
    count: number;
    in: number;
    out: number; // absolute
    net: number;
  }>;
  byCategory: Array<{
    category: string;
    in: number;
    out: number; // absolute
    net: number;
    count: number;
  }>;
  topMerchants: Array<{
    name: string;
    totalAbs: number;
    count: number;
  }>;
};

type MutableTotals = { in: number; out: number; net: number; count: number };

/** ---------- Helpers ---------- **/

function toISOYYYYMM(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

// Very lightweight categorization based on name keywords.
// Tweak to your domain as needed.
function categorize(name: string): string {
  const s = name.toLowerCase();
  if (/(stripe|paddle|shopify|square|paypal|revolut)/.test(s)) return "Revenue";
  if (/(tax|irs|hmrc|vat|saless*tax)/.test(s)) return "Taxes";
  if (/(payroll|gusto|rippling|deel|salary|wage)/.test(s)) return "Payroll";
  if (/(aws|amazon web services|gcp|google cloud|azure|digitalocean|vercel|render)/.test(s)) return "Infrastructure";
  if (/(google workspace|notion|slack|zoom|microsoft 365|dropbox)/.test(s)) return "SaaS";
  if (/(facebook ads|google ads|adwords|linkedin ads|twitter ads|tiktok ads)/.test(s)) return "Marketing";
  if (/(rent|lease|office)/.test(s)) return "Facilities";
  return "Other";
}

/** ---------- Core Analysis ---------- **/

export async function analyzeTransactions(input: unknown): Promise<AnalyzeResult> {
  const { transactions } = AnalyzeInputSchema.parse(input);

  // Normalize and enrich
  const norm: Array<Transaction & { _date: Date; _month: string; _category: string }> = transactions.map((t) => {
    const _date = toDate(t.date);
    const _month = toISOYYYYMM(_date);
    const _category = t.category?.trim() || categorize(t.name);
    return { ...t, _date, _month, _category };
  });

  // Totals
  let totalIn = 0;
  let totalOutAbs = 0;
  for (const t of norm) {
    if (t.amount >= 0) totalIn += t.amount;
    else totalOutAbs += Math.abs(t.amount);
  }
  const net = totalIn - totalOutAbs;

  // By month
  const monthMap = new Map<string, MutableTotals>();
  for (const t of norm) {
    const key = t._month;
    if (!monthMap.has(key)) monthMap.set(key, { in: 0, out: 0, net: 0, count: 0 });
    const m = monthMap.get(key)!;
    m.count += 1;
    if (t.amount >= 0) m.in += t.amount;
    else m.out += Math.abs(t.amount);
    m.net = m.in - m.out;
  }
  const byMonth = Array.from(monthMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, m]) => ({ month, ...m }));

  // By category
  const catMap = new Map<string, MutableTotals>();
  for (const t of norm) {
    const key = t._category;
    if (!catMap.has(key)) catMap.set(key, { in: 0, out: 0, net: 0, count: 0 });
    const c = catMap.get(key)!;
    c.count += 1;
    if (t.amount >= 0) c.in += t.amount;
    else c.out += Math.abs(t.amount);
    c.net = c.in - c.out;
  }
  const byCategory = Array.from(catMap.entries())
    .sort(([, A], [, B]) => B.out - A.out) // biggest spend first
    .map(([category, c]) => ({ category, ...c }));

  // Top merchants by absolute volume
  const merchMap = new Map<string, { totalAbs: number; count: number }>();
  for (const t of norm) {
    const key = t.name.trim();
    const cur = merchMap.get(key) || { totalAbs: 0, count: 0 };
    cur.totalAbs += Math.abs(t.amount);
    cur.count += 1;
    merchMap.set(key, cur);
  }
  const topMerchants = Array.from(merchMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.totalAbs - a.totalAbs)
    .slice(0, 10);

  return {
    ok: true,
    summary: {
      count: norm.length,
      totalIn: round2(totalIn),
      totalOut: round2(totalOutAbs),
      net: round2(net),
    },
    byMonth: byMonth.map((m) => ({ ...m, in: round2(m.in), out: round2(m.out), net: round2(m.net) })),
    byCategory: byCategory.map((c) => ({ ...c, in: round2(c.in), out: round2(c.out), net: round2(c.net) })),
    topMerchants: topMerchants.map((t) => ({ ...t, totalAbs: round2(t.totalAbs) })),
  };
}

/** ---------- Utilities ---------- **/

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** ---------- Notes ----------
 * - This module is server-only to avoid bundling Node-specific libs.
 * - If you later want to call Genkit or other Node-only tooling, import them dynamically **inside** a server function, e.g.:
 *
 *   const { genkit } = await import("genkit");
 *
 * - Your API route should set:
 *     export const runtime = "nodejs";
 *     export const dynamic = "force-dynamic"; // optional
 *   and lazy-import this function:
 *     const { analyzeTransactions } = await import("@/ai/flows/analyze-transactions");
 */