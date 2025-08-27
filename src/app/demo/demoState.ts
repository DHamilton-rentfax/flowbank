
"use client";

import { accounts as seedAccounts, transactions as seedTx, rules as seedRules, insights as seedInsights, team as seedTeam } from "@/demo/sampleData";

const KEY = "flowbank_demo_state_v1";

export type DemoState = {
  accounts: typeof seedAccounts;
  transactions: typeof seedTx;
  rules: typeof seedRules;
  insights: typeof seedInsights;
  team: typeof seedTeam;
};

export function loadState(): DemoState {
  if (typeof window === "undefined") {
    return { accounts: seedAccounts, transactions: seedTx, rules: seedRules, insights: seedInsights, team: seedTeam };
  }
  const raw = localStorage.getItem(KEY);
  if (!raw) return { accounts: seedAccounts, transactions: seedTx, rules: seedRules, insights: seedInsights, team: seedTeam };
  try {
    return JSON.parse(raw) as DemoState;
  } catch {
    return { accounts: seedAccounts, transactions: seedTx, rules: seedRules, insights: seedInsights, team: seedTeam };
  }
}

export function saveState(state: DemoState) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
  return loadState();
}
