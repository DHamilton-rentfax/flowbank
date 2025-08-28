// SERVER COMPONENT: calls server action
import { getAIFinancialAnalysis } from "../actions";

type Recurring = { merchant: string; average: number };
type Suggestion =
  | { title: string; detail: string; impactPerMonth?: number }
  | { title: string; detail: string };

type Analysis = {
  timeframeDays: number;
  sampleCount: number;
  monthlySpend?: number;
  recurring: Recurring[];
  suggestions: Suggestion[];
};

export default async function ReportingPage() {
  const data = (await getAIFinancialAnalysis()) as Analysis;

  const money = (cents?: number) =>
    typeof cents === "number" ? `$${(cents / 100).toFixed(2)}` : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reporting &amp; AI Financial Advisor</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Timeframe</div>
          <div className="text-xl font-semibold">
            {data?.timeframeDays ?? "—"} days
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Sample Size</div>
          <div className="text-xl font-semibold">
            {data?.sampleCount ?? "—"}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Est. Monthly Spend</div>
          <div className="text-xl font-semibold">{money(data?.monthlySpend)}</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">Detected Recurring Charges</h2>
        {data?.recurring?.length ? (
          <ul className="space-y-2">
            {data.recurring.map((r, i) => (
              <li key={`${r.merchant}-${i}`} className="flex justify-between">
                <span>{r.merchant}</span>
                <span className="font-medium">{money(r.average)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">None detected yet.</p>
        )}
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">AI Suggestions</h2>
        {data?.suggestions?.length ? (
          <ul className="space-y-3">
            {data.suggestions.map((s, i) => (
              <li key={`${s.title}-${i}`} className="rounded-md border p-3">
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-700">{s.detail}</div>
                {"impactPerMonth" in s && typeof s.impactPerMonth === "number" && (
                  <div className="mt-1 text-sm">
                    Est. impact: <b>{money(s.impactPerMonth)}/mo</b>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No suggestions yet.</p>
        )}
      </div>
    </div>
  );
}
