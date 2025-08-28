"use client";

import { useState } from "react";

type ExternalAccount = { id: string; name: string; last4?: string };
export default function SplitsClient({
  initialAccounts,
  canAdd,
  limit,
  plan,
}: {
  initialAccounts: ExternalAccount[];
  canAdd: boolean;
  limit: number;
  plan: string;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);

  async function addAccount(payload: any) {
    const res = await fetch("/api/external-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to add account");
    const created = await res.json();
    setAccounts((x) => [...x, created]);
  }

  async function removeAccount(id: string) {
    const res = await fetch(`/api/external-accounts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove account");
    setAccounts((x) => x.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="font-medium">Plan: {plan}</div>
        <div className="text-sm text-muted-foreground">
          External account limit: {limit} • Currently linked: {accounts.length}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-2 font-medium">External Accounts</div>
        <ul className="space-y-2">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-md border p-2">
              <span>{a.name}{a.last4 ? ` •••• ${a.last4}` : ""}</span>
              <button className="rounded-md border px-2 py-1 text-xs hover:bg-muted" onClick={() => removeAccount(a.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3">
          <button
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            onClick={() => addAccount({ name: "New External", last4: "0000" })}
            disabled={!canAdd || accounts.length >= limit}
          >
            Add External Account
          </button>
        </div>
      </div>
    </div>
  );
}
