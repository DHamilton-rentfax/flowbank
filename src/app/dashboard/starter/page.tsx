"use client";

import dynamic from "next/dynamic";
const BillingPortalButton = dynamic(() => import("../../components/BillingPortalButton").catch(() => Promise.resolve(() => null)), { ssr: false });

export default function StarterDash() {
 return (
 <div className="space-y-4">
 <h1 className="text-2xl font-semibold">Starter Plan</h1>
 <p>Weekly insights + simple AI suggestions.</p>
 <div className="rounded-lg border p-4 bg-white">
 <h2 className="font-medium mb-2">Included</h2>
 <ul className="list-disc ml-5">
 <li>1 external account for splits</li>
 <li>Weekly AI insights</li>
 <li>Email support</li>
 </ul>
 </div>
 <div className="flex gap-3">
 <a href="/checkout/plan?upgrade=pro" className="px-4 py-2 border rounded-md">Upgrade to Pro</a>
 <BillingPortalButton />
 </div>
 </div>
 );
}
