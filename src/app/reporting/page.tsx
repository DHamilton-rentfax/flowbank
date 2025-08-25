import { getAIFinancialAnalysis } from "../actions";

export default async function ReportingPage() {
  const data = await getAIFinancialAnalysis();

  const money = (cents?: number) =>
    typeof cents === "number" ? `$${(cents / 100).toFixed(2)}` : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reporting & AI Financial Advisor</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">Timeframe</div>
          <div className="text-xl font-semibold">{data.timeframeDays} days</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">Sample Size</div>
          <div className="text-xl font-semibold">{data.sampleCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">Est. Monthly Spend</div>
          <div className="text-xl font-semibold">{money(data.monthlySpend)}</div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">Detected Recurring Charges</h2>
        {data.recurring.length === 0 ? (
          <p className="text-sm text-gray-600">None detected yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.recurring.map((r, i) => (
              <li key={i} className="flex justify-between">
                <span>{r.merchant}</span>
                <span className="font-medium">${(r.average / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">AI Suggestions</h2>
        {data.suggestions.length === 0 ? (
          <p className="text-sm text-gray-600">No suggestions yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.suggestions.map((s, i) => (
              <li key={i} className="border rounded-md p-3">
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-700">{s.detail}</div>
                {"impactPerMonth" in s && typeof s.impactPerMonth === "number" && (
                  <div className="text-sm mt-1">Est. impact: <b>${(s.impactPerMonth / 100).toFixed(2)}/mo</b></div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
import { getAIFinancialAnalysis } from "../actions";

export default async function ReportingPage() {
  const data = await getAIFinancialAnalysis();

  const money = (cents?: number) =>
    typeof cents === "number" ? `$${(cents / 100).toFixed(2)}` : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reporting & AI Financial Advisor</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">Timeframe</div>
          <div className="text-xl font-semibold">{data.timeframeDays} days</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">Sample Size</div>
          <div className="text-xl font-semibold">{data.sampleCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <div className="text-sm text-gray-500">Est. Monthly Spend</div>
          <div className="text-xl font-semibold">{money(data.monthlySpend)}</div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">Detected Recurring Charges</h2>
        {data.recurring.length === 0 ? (
          <p className="text-sm text-gray-600">None detected yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.recurring.map((r, i) => (
              <li key={i} className="flex justify-between">
                <span>{r.merchant}</span>
                <span className="font-medium">${(r.average / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">AI Suggestions</h2>
        {data.suggestions.length === 0 ? (
          <p className="text-sm text-gray-600">No suggestions yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.suggestions.map((s, i) => (
              <li key={i} className="border rounded-md p-3">
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-700">{s.detail}</div>
                {"impactPerMonth" in s && typeof s.impactPerMonth === "number" && (
                  <div className="text-sm mt-1">Est. impact: <b>${(s.impactPerMonth / 100).toFixed(2)}/mo</b></div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}