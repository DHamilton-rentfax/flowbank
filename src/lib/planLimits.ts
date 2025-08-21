ts
export type PlanType = "free" | "starter" | "pro" | "enterprise" | "super_admin";

const planLimits: Record<PlanType, number> = {
  free: 0,
  starter: 1,
  pro: 5,
  enterprise: -1, // -1 signifies unlimited
  super_admin: -1, // Super admin also has unlimited access
};

export function getMaxExternalAccounts(plan: PlanType): number {
  return planLimits[plan] || 0; // Default to 0 if plan is not found
}