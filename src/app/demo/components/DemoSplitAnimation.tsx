
"use client";

import { useState } from "react";
import type { DemoState } from "../demoState";
import { saveState } from "../demoState";

export default function DemoSplitAnimation({ state, onState }: { state: DemoState; onState: (s: DemoState) => void }) {
  const [running, setRunning] = useState(false);

  async function runSplit() {
    if (running) return;
    setRunning(true);
    // Use the most recent positive income transaction as the "income to split"
    const income = state.transactions.find(t => t.amount > 0)?.amount ?? 0;
    if (income <= 0) { setRunning(false); return; }

    // Calculate allocations based on rules
    const allocations = state.rules.map(r => ({ id: r.toAccountId, amount: Math.round(income * (r.percent/100)) }));

    // Animate balances (simple staged timeout)
    const next = { ...state, accounts: state.accounts.map(a => ({ ...a })) };
    for (let i = 0; i < allocations.length; i++) {
      await new Promise(res => setTimeout(res, 500));
      const { id, amount } = allocations[i];
      // deduct from checking, add to target
      const checking = next.accounts.find(a => a.id === "acc_main")!;
      const target = next.accounts.find(a => a.id === id)!;
      checking.balance -= amount;
      target.balance += amount;
      onState(next);
    }
    saveState(next);
    setRunning(false);
  }

  const totalIncome = state.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Run Split</h3>
          <p className="text-sm text-gray-500">Automatically allocates new income across your buckets using rules.</p>
        </div>
        <button
          disabled={running}
          onClick={runSplit}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {running ? "Allocating…" : "Run Now"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {state.accounts.map((a) => (
          <div key={a.id} className="rounded-xl border p-3">
            <div className="text-sm text-gray-500">{a.name}</div>
            <div className="mt-1 text-xl font-semibold">${a.balance.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">Demo income seen: ${totalIncome.toLocaleString()}.</p>
    </section>
  );
}
