ts
export type PlanType = "free" | "starter" | "pro" | "enterprise";
export type AddonKey = "aiOptimization" | "prioritySupport" | "extraSeats";

export interface UserPlanInfo {
  plan: PlanType;
  addons?: AddonKey[];
}

export function hasFeature(
  user: UserPlanInfo,
  feature: "aiFinancialAdvisor" | "advancedAnalytics" | "prioritySupport"
): boolean {
  const { plan, addons = [] } = user;

  const isAddonEnabled = (key: AddonKey) => addons.includes(key);

  switch (feature) {
    case "aiFinancialAdvisor":
      return plan === "pro" || plan === "enterprise" || isAddonEnabled("aiOptimization");

    case "advancedAnalytics":
      return plan === "pro" || plan === "enterprise";

    case "prioritySupport":
      return plan === "pro" || plan === "enterprise" || isAddonEnabled("prioritySupport");

    default:
      return false;
  }
}