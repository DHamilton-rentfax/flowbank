tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/client";
import { hasFeatureAccess } from "@/lib/feature-gates"; // Assuming featureGates is still used for initial access check
import { canAddExternalAccount, EXTERNAL_ACCOUNT_LIMITS } from "@/lib/limits"; // Import canAddExternalAccount and limits
import { Button } from "@/components/ui/button"; // Assuming you have a button component
import { Input } from "@/components/ui/input"; // Assuming you have an input component
import { Label } from "@/components/ui/label"; // Assuming you have a label component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming you have a select component
import { UpgradePrompt } from "@/components/UpgradePrompt"; // Assuming you have an upgrade prompt component

export default function SplitsPage() {
  const { user, plan, loading, isSuperAdmin } = useAuth(); // Assuming isSuperAdmin is available from useAuth
  const router = useRouter();

  const [amountPercent, setAmountPercent] = useState(10);
  const [recipientType, setRecipientType] = useState("own"); // 'own' or 'external'
  const [externalAccount, setExternalAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [memo, setMemo] = useState("");
  const [userExternalAccountsCount, setUserExternalAccountsCount] = useState(0);
  const [checkingLimits, setCheckingLimits] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchExternalAccounts = async () => {
        const splitsRef = collection(db, "splits");
        const q = query(splitsRef, where("createdBy", "==", user.uid), where("recipientType", "==", "external"));
        const querySnapshot = await getDocs(q);
        setUserExternalAccountsCount(querySnapshot.size);
        setCheckingLimits(false);
      };
      fetchExternalAccounts();
    }
  }, [user]);

  if (loading || !user || checkingLimits) {
 return <div className="p-4">Loading...</div>; // Or a loading spinner
  }

  const userPlan = (plan || "free") as PlanType; // Default to free if plan is not set
  const maxExternalAccounts = getMaxExternalAccounts(userPlan);
  const canAddExternalAccount = maxExternalAccounts === -1 || userExternalAccountsCount < maxExternalAccounts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recipientType === "external" && !canAddExternalAccount) {
       alert(`You cannot add more external accounts on your ${userPlan} plan.`);
       return;
    }

    const splitData = {
      amountPercent,
      recipientType,
      ...(recipientType === "external"
        ? {
            externalAccount, // This should be securely handled, not stored directly like this in a real app
            recipientName,
            recipientEmail,
            memo,
          }
        : {}),
      createdAt: Date.now(),
      createdBy: user.uid,
    };

    const splitRef = doc(db, "splits", `${user.uid}_${Date.now()}`);
    await setDoc(splitRef, splitData);

    alert("Split created successfully");
    router.push("/dashboard"); // Redirect to dashboard after creating split
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Create Income Split</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <Label htmlFor="amountPercent">Amount (%)</Label>
          <Input
            id="amountPercent"
            type="number"
            min="1"
            max="100"
            value={amountPercent}
            onChange={(e) => setAmountPercent(parseInt(e.target.value))}
            required
          />
        </div>
        
        <div>
 <Label htmlFor="recipientType">Recipient Type</Label>
          <Select onValueChange={(value) => setRecipientType(value)} value={recipientType}>
 <SelectTrigger id="recipientType">
 <SelectValue placeholder="Select recipient type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="own">My Account</SelectItem>
              <SelectItem value="external" disabled={!canAddExternal}>External Account</SelectItem>
 </SelectContent>
 </Select>
          {recipientType === "external" && !canAddExternal && userPlan !== "free" && ( // Show limit message for Starter and above if limit reached
 <p className="text-sm text-red-500 mt-1">
 You have reached your limit of{' '}
                {EXTERNAL_ACCOUNT_LIMITS[userPlan] === 'unlimited'
 ? 'unlimited'
 : EXTERNAL_ACCOUNT_LIMITS[userPlan]} external accounts for your{' '}
 {userPlan} plan.
 </p>
 )}
          {recipientType === "external" && userPlan === "free" && !canAddExternal && ( // Show upgrade prompt specifically for Free users trying to add external
 <UpgradePrompt currentPlan={userPlan as any} requiredPlan="starter" /> // Assuming external splits start from Starter
 )}
 </div>


        {recipientType === "external" && hasFeatureAccess(userPlan, "externalSplits") && (
          <>
            <div>
              <Label htmlFor="externalAccount">External Bank Account #</Label>
              <Input
                id="externalAccount"
                type="text"
                value={externalAccount}
                onChange={(e) => setExternalAccount(e.target.value)}
                className="input"
                required
 disabled={!canAddExternal}
              />
               {!canAddExternal && userPlan !== "free" && EXTERNAL_ACCOUNT_LIMITS[userPlan] !== 'unlimited' && (
                <p className="text-sm text-red-500 mt-1">You have reached your limit of {EXTERNAL_ACCOUNT_LIMITS[userPlan]} external accounts for your {userPlan} plan.</p>
             )}
               {!canAddExternal && userPlan !== "free" && EXTERNAL_ACCOUNT_LIMITS[userPlan] === 'unlimited' && (
                <p className="text-sm text-red-500 mt-1">You have reached your limit of {maxExternalAccounts} external accounts for your {userPlan} plan.</p>
             )}
            </div>
            <div>
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
 className="input"
 disabled={!canAddExternal}
              />
            </div>
            <div>
              <Label htmlFor="recipientEmail">Recipient Email (optional)</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
 className="input"
              />
            </div>
            <div>
              <Label htmlFor="memo">Memo (optional)</Label>
              <Input
                id="memo"
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
 className="input"
 disabled={!canAddExternal}
              />
            </div>
          </>
        )}

        <Button type="submit" className="btn w-full" disabled={!canAddExternal && recipientType === "external"}>
          Create Split
        </Button>
      </form>
    </div>
  );
}