"use client";

import { useApp } from "@/contexts/app-provider";
import { AllocationRules } from "./allocation-rules";
import { AIPlanGenerator } from "./ai-plan-generator";
import { useState } from "react";
import type { AllocationRule } from "@/lib/types";

export function SettingsClient() {
  const { rules, updateRules: saveRules } = useApp();
  const [currentRules, setCurrentRules] = useState<AllocationRule[]>(rules);

  const handleUpdateRules = (newRules: AllocationRule[]) => {
    setCurrentRules(newRules);
  };
  
  const handleSave = () => {
    saveRules(currentRules);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AllocationRules 
            rules={currentRules} 
            setRules={handleUpdateRules}
            onSave={handleSave}
          />
        </div>
        <div className="lg:col-span-1">
          <AIPlanGenerator onApplyRules={handleUpdateRules} />
        </div>
      </div>
    </div>
  );
}
