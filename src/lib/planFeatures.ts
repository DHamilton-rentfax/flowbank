ts
export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'

export const featureGates: Record<Plan, string[]> = {
  free: ['connect-bank', 'view-dashboard'],
  starter: ['connect-bank', 'view-dashboard', 'weekly-insights', 'basic-ai'],
  pro: [
    'connect-bank',
    'view-dashboard',
    'weekly-insights',
    'basic-ai',
    'full-ai',
    'analytics',
    'priority-support',
  ],
  enterprise: [
    'connect-bank',
    'view-dashboard',
    'weekly-insights',
    'basic-ai',
    'full-ai',
    'analytics',
    'priority-support',
    'team-seats',
    'integrations',
    'sla',
  ],
}

// Helper to check if a user has access to a feature
export function hasFeatureAccess(plan: Plan, feature: string): boolean {
  return featureGates[plan]?.includes(feature)
}