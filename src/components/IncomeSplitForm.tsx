tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { hasFeatureAccess, Plan } from "@/lib/planFeatures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpgradePrompt } from "@/components/UpgradePrompt";

// Assuming this component is used within a dashboard page that provides the user's plan
interface IncomeSplitFormProps {
  userPlan: Plan;
}

export default function IncomeSplitForm({ userPlan }: IncomeSplitFormProps) {
  const [splits, setSplits] = useState([{ percentage: "", destination: "internal", label: "", externalAccount: null }]);
  const [isExternalAccount, setIsExternalAccount] = useState(false);

  const handleAddSplit = () => {
    setSplits([...splits, { percentage: "", destination: "internal", label: "", externalAccount: null }]);
  };

  const handleSplitChange = (index: number, field: string, value: any) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const handleExternalAccountToggle = (checked: boolean) => {
    setIsExternalAccount(checked);
    // Reset external account details when toggled off
    if (!checked) {
      setSplits(splits.map(split => ({ ...split, externalAccount: null })));
    }
  };

  const handleExternalAccountChange = (index: number, field: string, value: any) => {
    const newSplits = [...splits];
    newSplits[index].externalAccount = { ...newSplits[index].externalAccount, [field]: value };
    setSplits(newSplits);
  };

  // Check if the user plan allows external accounts
  const canUseExternalAccounts = hasFeatureAccess(userPlan, "integrations"); // Assuming 'integrations' feature gate covers external accounts

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Submitting splits:", splits);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {splits.map((split, index) => (
        <div key={index} className="border p-4 rounded-md space-y-4">
          <div>
            <Label htmlFor={`percentage-${index}`}>Percentage</Label>
            <Input
              id={`percentage-${index}`}
              type="number"
              value={split.percentage}
              onChange={(e) => handleSplitChange(index, "percentage", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor={`label-${index}`}>Label (e.g., To Savings, To Partner)</Label>
            <Input
              id={`label-${index}`}
              type="text"
              value={split.label}
              onChange={(e) => handleSplitChange(index, "label", e.target.value)}
              required
            />
          </div>

          {/* External Account Option (Gated) */}
          {canUseExternalAccounts && (
            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`external-${index}`}
                  checked={isExternalAccount}
                  onCheckedChange={(checked) => handleExternalAccountToggle(checked as boolean)}
                />
                <Label htmlFor={`external-${index}`}>Send to an external account</Label>
              </div>

              {isExternalAccount && (
                <div className="ml-6 mt-4 space-y-4">
                  <div>
                    <Label htmlFor={`bankName-${index}`}>Bank Name</Label>
                    <Input
                      id={`bankName-${index}`}
                      type="text"
                      value={split.externalAccount?.bankName || ""}
                      onChange={(e) => handleExternalAccountChange(index, "bankName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`routingNumber-${index}`}>Routing Number</Label>
                    <Input
                      id={`routingNumber-${index}`}
                      type="text"
                      value={split.externalAccount?.routingNumber || ""}
                      onChange={(e) => handleExternalAccountChange(index, "routingNumber", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`accountNumber-${index}`}>Account Number</Label>
                    <Input
                      id={`accountNumber-${index}`}
                      type="text"
                      value={split.externalAccount?.accountNumber || ""}
                      onChange={(e) => handleExternalAccountChange(index, "accountNumber", e.target.value)}
                      required
                    />
                  </div>
                   <div>
                    <Label htmlFor={`accountType-${index}`}>Account Type</Label>
                     <Select onValueChange={(value) => handleExternalAccountChange(index, "accountType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

           {/* Show Upgrade Prompt if feature is not available */}
           {!canUseExternalAccounts && (
             <UpgradePrompt currentPlan={userPlan} requiredPlan="pro" /> // Assuming Pro unlocks this feature
           )}
        </div>
      ))}

      <Button type="button" onClick={handleAddSplit}>Add Split</Button>
      <Button type="submit">Save Splits</Button>
    </form>
  );
}