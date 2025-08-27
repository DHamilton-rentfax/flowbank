
"use client";

import type { Insight } from "@/demo/sampleData";

export default function DemoAIInsights({ insights }: { insights: Insight[] }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-semibold">AI Financial Advisor</div>
      <div className="grid gap-3 md:grid-cols-3">
        {insights.map((i) => (
          <div key={i.id} className="rounded-xl border p-3">
            <div className="font-medium">{i.title}</div>
            <p className="mt-1 text-sm text-gray-600">{i.detail}</p>
            {i.impactMonthly !== 0 && (
              <div className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Est. +${i.impactMonthly}/mo
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3">
        <a href="/pricing" className="text-sm font-medium underline">Unlock AI with a Pro plan →</a>
      </div>
    </section>
  );
}
