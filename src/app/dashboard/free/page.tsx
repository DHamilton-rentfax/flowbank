export default function FreeDash() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Free Plan</h1>
      <p>Welcome! Connect a bank account and set up your first income split.</p>
      <div className="rounded-lg border p-4 bg-white">
        <h2 className="font-medium mb-2">What you can do</h2>
        <ul className="list-disc ml-5">
          <li>Connect one bank account</li>
          <li>Create split rules (no external accounts)</li>
          <li>Preview AI insights (limited)</li>
        </ul>
      </div>
      <a href="/checkout/plan?upgrade=starter" className="inline-block px-4 py-2 border rounded-md">
        Upgrade to Starter
      </a>
    </div>
  );
}

export default function FreeDash() {
 return (
 <div className="space-y-4">
 <h1 className="text-2xl font-semibold">Free Plan</h1>
 <p>Welcome! Connect a bank account and set up your first income split.</p>
 <div className="rounded-lg border p-4 bg-white">
 <h2 className="font-medium mb-2">What you can do</h2>
 <ul className="list-disc ml-5">
 <li>Connect one bank account</li>
 <li>Create split rules (no external accounts)</li>
 <li>Preview AI insights (limited)</li>
 </ul>
 </div>
 <a href="/checkout/plan?upgrade=starter" className="inline-block px-4 py-2 border rounded-md">
 Upgrade to Starter
 </a>
 </div>
 );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PieChart, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import app from "@/firebase/client";
import { useAuth } from "@/hooks/use-auth";

type Rule = {
  id: string;
  label: string;
  percent: number; // 0..100
};

const db = getFirestore(app);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_RULES: Rule[] = [
  { id: uid(), label: "Taxes", percent: 25 },
  { id: uid(), label: "Profit", percent: 10 },
  { id: uid(), label: "Operating Costs", percent: 65 },
];

export default function SplitsPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [loadedRules, setLoadedRules] = useState<Rule[] | null>(null); // for dirty check
  const [estimate, setEstimate] = useState<number>(10000);

  const totalPercent = useMemo(
    () => rules.reduce((sum, r) => sum + (Number.isFinite(r.percent) ? r.percent : 0), 0),
    [rules]
  );

  const remaining = Math.max(0, 100 - totalPercent);
  const valid = totalPercent === 100 && rules.length > 0 && rules.every((r) => r.percent >= 0);

  const isDirty =
    loadedRules === null
      ? false
      : JSON.stringify(
          rules.map(({ label, percent }) => ({ label: label.trim(), percent }))
        ) !==
        JSON.stringify(
          loadedRules.map(({ label, percent }) => ({ label: label.trim(), percent }))
        );

  // load/subscribe from Firestore
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid, "settings", "splits");
    // prime with a one-time read for faster first paint
    getDoc(ref).then((snap) => {
      const data = snap.data();
      if (data?.rules?.length) {
        setRules(
          data.rules.map((r: any) => ({
            id: r.id || uid(),
            label: r.label || "",
            percent: Number(r.percent) || 0,
          }))
        );
        setLoadedRules(
          data.rules.map((r: any) => ({
            id: r.id || uid(),
            label: r.label || "",
            percent: Number(r.percent) || 0,
          }))
        );
      } else {
        setLoadedRules(DEFAULT_RULES);
      }
    });

    // live updates (e.g., another tab)
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (data?.rules?.length) {
        const next = data.rules.map((r: any) => ({
          id: r.id || uid(),
          label: r.label || "",
          percent: Number(r.percent) || 0,
        }));
        setRules(next);
        setLoadedRules(next);
      }
    });

    return () => unsub();
  }, [user]);

  function setRule(index: number, patch: Partial<Rule>) {
    setRules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addRule() {
    setRules((prev) => [...prev, { id: uid(), label: "New Category", percent: 0 }]);
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!user) {
      toast.error("Please sign in to save your splits.");
      return;
    }
    const ref = doc(db, "users", user.uid, "settings", "splits");
    const payload = {
      rules: rules.map(({ id, label, percent }) => ({
        id,
        label: (label || "").trim(),
        percent: Number(percent) || 0,
      })),
      updatedAt: serverTimestamp(),
    };

    const promise = setDoc(ref, payload, { merge: true }).then(() => {
      setLoadedRules(rules);
    });

    toast.promise(promise, {
      loading: "Saving splits…",
      success: "Splits saved",
      error: "Failed to save splits",
    });
  }

  function handleReset() {
    setRules(DEFAULT_RULES);
    toast.message("Reset to defaults");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-black/5">
            <PieChart className="h-4 w-4" />
            Allocation Rules
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Set your splits</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Define how incoming revenue is divided across categories. Your total must add up to 100%.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-3 text-sm shadow-sm">
          <div className="flex items-center justify-between gap-8">
            <label className="block text-gray-600">Revenue preview</label>
            <input
              type="number"
              min={0}
              step={100}
              className="w-36 rounded-lg border px-3 py-2 text-right outline-none"
              value={estimate}
              onChange={(e) => setEstimate(Number(e.target.value || 0))}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Used to preview dollar amounts below.</p>
        </div>
      </div>

      {/* Table */}
      <div className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="grid grid-cols-12 border-b bg-gray-50 px-4 py-3 text-xs font-medium text-gray-600">
          <div className="col-span-6">Category</div>
          <div className="col-span-3 text-right">Percent</div>
          <div className="col-span-3 text-right">Preview</div>
        </div>

        {rules.map((r, i) => {
          const amount = Math.round((estimate * (r.percent || 0)) / 100);
          return (
            <div key={r.id} className="grid grid-cols-12 items-center border-b px-4 py-3 last:border-none">
              {/* label */}
              <div className="col-span-6">
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none"
                  value={r.label}
                  onChange={(e) => setRule(i, { label: e.target.value })}
                />
              </div>

              {/* percent */}
              <div className="col-span-3 flex items-center justify-end gap-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  className="w-24 rounded-lg border px-3 py-2 text-right outline-none"
                  value={Number.isFinite(r.percent) ? r.percent : 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setRule(i, { percent: Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0 });
                  }}
                />
                <span className="text-sm text-gray-500">%</span>
                <button
                  aria-label="Remove category"
                  onClick={() => removeRule(i)}
                  className="rounded-lg border px-2 py-1 text-gray-600 hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* preview */}
              <div className="col-span-3 text-right tabular-nums">${amount.toLocaleString()}</div>
            </div>
          );
        })}

        {/* Footer row */}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={addRule} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add category
            </Button>

            <div
              className={
                "rounded-full px-3 py-1 text-xs font-medium " +
                (remaining === 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200")
              }
            >
              {remaining === 0 ? "Total: 100%" : `Remaining: ${Math.max(0, remaining).toFixed(0)}%`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!valid || !isDirty} className="min-w-28">
              {isDirty ? "Save" : "Saved"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 text-sm text-gray-600">
        <p>
          Tip: Many businesses start with <span className="font-medium">Taxes 25%</span>,{" "}
          <span className="font-medium">Profit 10%</span>, and{" "}
          <span className="font-medium">Operating Costs 65%</span>, then tweak over time.
        </p>
      </div>
    </div>
  );
}
