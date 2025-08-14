
import React from "react";
import Link from "next/link";

interface PlanGateProps {
    plan: string;
    required: 'starter' | 'pro' | 'enterprise';
    children: React.ReactNode;
}

export default function PlanGate({ plan, required = "starter", children }: PlanGateProps) {
  const priority: { [key: string]: number } = { free: 0, starter: 1, pro: 2, enterprise: 3 };
  
  if (priority[plan] < priority[required]) {
    return (
      <div className="p-6 border rounded-xl bg-yellow-50">
        <p className="font-semibold mb-2">Upgrade required</p>
        <p className="mb-4">This feature requires the {required} plan.</p>
        <Link className="px-4 py-2 rounded bg-black text-white" href="/pricing">See plans</Link>
      </div>
    );
  }
  return <>{children}</>;
}
