// file: src/app/(app)/reporting/page.tsx
// Server component. Aggregates Firestore transactions into a modern Reporting UI.
// Assumes you have Firebase Admin initialized in `@/firebase/server` with `getAdminApp()`.
// Replace collection/field names below if yours differ.

import { getAdminApp } from "@/firebase/server"; // <- ensure this exists in your project
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// If you deploy behind ISR, disable caching so charts reflect fresh data in dev.
export const revalidate = 0;

// ---- Types ----
interface Txn {
  id: string;
  amount: number; // positive for income, negative for expense OR use `type` field below
  category?: string;
  type?: "income" | "expense"; // optional if your amounts are signed
  date: Date; // Firestore Timestamp in DB
}

// ---- Data Access ----
async function fetchTransactions(days = 90): Promise<Txn[]> {
  const db = getFirestore(getAdminApp());
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fromTs = Timestamp.fromDate(from);

  const snap = await db
    .collection("transactions")
    .where("date", ">=", fromTs)
    .orderBy("date", "asc")
    .limit(2000)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      amount: typeof data.amount === "number" ? data.amount : 0,
      category: data.category || "Uncategorized",
      type: data.type as Txn["type"],
      date: (data.date?.toDate?.() ?? new Date(data.date)) as Date,
    } as Txn;
  });
}

// ---- Aggregation helpers ----
function toMonthKey(dt: Date) {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function aggregate(transactions: Txn[]) {
  // KPI totals (last 30 days)
  const thirtyAgo = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  let income30 = 0;
  let expense30 = 0;

  // Category spend (last 30 days)
  const catMap = new Map<string, number>();

  // Monthly series (last 12 months)
  const now = new Date();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.toLocaleString(undefined, { month: "short" })} ${String(d.getFullYear()).slice(-2)}`);
  }

  const monthKeys = months.map((label, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return toMonthKey(d);
  });

  const incomeByMonth = Object.fromEntries(monthKeys.map((k) => [k, 0]));
  const expenseByMonth = Object.fromEntries(monthKeys.map((k) => [k, 0]));

  for (const t of transactions) {
    const signed = resolveSignedAmount(t);
    const isIncome = signed > 0;

    if (t.date >= thirtyAgo) {
      if (isIncome) income30 += signed; else expense30 += -signed;
      const cat = t.category || "Uncategorized";
      if (!isIncome) catMap.set(cat, (catMap.get(cat) || 0) + -signed);
    }

    const mk = toMonthKey(t.date);
    if (mk in incomeByMonth) {
      if (isIncome) incomeByMonth[mk] += signed; else expenseByMonth[mk] += -signed;
    }
  }

  const categories = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, amount]) => ({ name, amount }));

  const incomeSeries = monthKeys.map((k) => incomeByMonth[k] || 0);
  const expenseSeries = monthKeys.map((k) => expenseByMonth[k] || 0);

  return { months, income30, expense30, categories, incomeSeries, expenseSeries };
}

function resolveSignedAmount(t: Txn): number {
  if (typeof t.amount === "number") {
    if (t.type === "expense" && t.amount > 0) return -t.amount;
    return t.amount; // assume signed value already
  }
  return 0;
}

// ---- Page ----
export default async function ReportingPage() {
  const txns = await fetchTransactions(365); // pull 12 months +
  const { months, income30, expense30, categories, incomeSeries, expenseSeries } = aggregate(txns);

  const maxBar = Math.max(...incomeSeries, ...expenseSeries, 1);
  const maxCat = Math.max(...categories.map((c) => c.amount), 1);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Reporting</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Income vs. expenses and category trends from your real data.</p>
      </header>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KPI label="Income (30d)" value={income30} positive />
        <KPI label="Expenses (30d)" value={-expense30} negative />
      </div>

      {/* Income vs Expense (12 mo) */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Income vs. Expenses (12 months)</h3>
          <div className="text-xs text-zinc-500">USD</div>
        </div>
        <div className="mt-5 grid grid-cols-12 gap-2 items-end">
          {months.map((m, i) => (
            <div key={m} className="flex flex-col items-center gap-1">
              <div className="w-10">
                <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded flex items-end overflow-hidden">
                  <div className="w-1/2 bg-emerald-500/90" style={{ height: `${(incomeSeries[i] / maxBar) * 100}%` }} title={`Income ${formatCurrency(incomeSeries[i])}`} />
                  <div className="w-1/2 bg-rose-500/90" style={{ height: `${(expenseSeries[i] / maxBar) * 100}%` }} title={`Expenses ${formatCurrency(expenseSeries[i])}`} />
                </div>
              </div>
              <div className="text-xs text-zinc-500">{m.split(" ")[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Top Categories (30d)</h3>
        <div className="mt-4 space-y-3">
          {categories.length === 0 && (
            <div className="text-sm text-zinc-500">No expenses in the last 30 days.</div>
          )}
          {categories.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-xs text-zinc-500"><span>{c.name}</span><span>{formatCurrency(c.amount)}</span></div>
              <div className="mt-1 h-2.5 rounded bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full rounded bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${(c.amount / maxCat) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- UI bits ----
function KPI({ label, value, positive, negative }: { label: string; value: number; positive?: boolean; negative?: boolean }) {
  const color = positive ? "text-emerald-600" : negative ? "text-rose-600" : "text-zinc-600";
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className={`mt-2 text-2xl font-semibold tabular-nums ${color}`}>{formatCurrency(value)}</div>
    </div>
  );
}

function formatCurrency(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return sign + abs.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function formatValue(v: number, suffix?: string) {
  if (suffix) return `${v}${suffix}`;
  return formatCurrency(v);
}