
"use client";

import type { Rule } from "@/demo/sampleData";
import type { DemoState } from "../demoState";
import { saveState } from "../demoState";

export default function DemoRules({ state, onState }: { state: DemoState; onState: (s: DemoState) => void }) {
  function updatePercent(id: string, val: number) {
    const next = { ...state, rules: state.rules.map(r => r.id === id ? { ...r, percent: val } : r) };
    onState(next);
    saveState(next);
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-semibold">Allocation Rules</div>
      <div className="grid gap-3 md:grid-cols-3">
        {state.rules.map((r: Rule) => (
          <div key={r.id} className="rounded-xl border p-3">
            <div className="text-sm text-gray-600">{r.name}</div>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={60}
                value={r.percent}
                onChange={(e) => updatePercent(r.id, Number(e.target.value))}
                className="w-full"
              />
              <div className="w-12 text-right font-medium">{r.percent}%</div>
            </div>
            <div className="mt-1 text-xs text-gray-500">To: {state.accounts.find(a => a.id === r.toAccountId)?.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
