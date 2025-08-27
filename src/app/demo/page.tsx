
"use client";

import { useEffect, useMemo, useState } from "react";
import DemoHero from "./components/DemoHero";
import DemoKpis from "./components/DemoKpis";
import DemoSplitAnimation from "./components/DemoSplitAnimation";
import DemoCharts from "./components/DemoCharts";
import DemoRules from "./components/DemoRules";
import DemoAIInsights from "./components/DemoAIInsights";
import DemoTeam from "./components/DemoTeam";
import DemoCta from "./components/DemoCta";
import { loadState, resetState } from "./demoState";

export default function DemoPage() {
  const [state, setState] = useState(loadState());

  // Keep localStorage in sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "flowbank_demo_state_v1") setState(loadState());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const balances = useMemo(() => ([
    { label: "Business Checking", value: state.accounts.find(a => a.id === "acc_main")!.balance },
    { label: "Taxes", value: state.accounts.find(a => a.id === "acc_tax")!.balance },
    { label: "Marketing", value: state.accounts.find(a => a.id === "acc_marketing")!.balance },
    { label: "Profit Savings", value: state.accounts.find(a => a.id === "acc_savings")!.balance },
  ]), [state.accounts]);

  // Simple sample series for the chart
  const chartSeries = [4_200, 1_100, 3_100, 2_250, 4_800, 2_900, 3_700];

  return (
    <main className="space-y-6">
      <DemoHero onReset={() => setState(resetState())} />
      <DemoKpis balances={balances} />
      <DemoSplitAnimation state={state} onState={setState} />
      <div className="grid gap-4 md:grid-cols-2">
        <DemoCharts series={chartSeries} />
        <DemoRules state={state} onState={setState} />
      </div>
      <DemoAIInsights insights={state.insights} />
      <DemoTeam team={state.team} />
      <DemoCta />
    </main>
  );
}
