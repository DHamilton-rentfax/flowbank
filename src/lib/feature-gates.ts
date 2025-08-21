export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

export type Features = {
  aiOptimization: boolean;
  prioritySupport: boolean;
  analytics: boolean;
  seats: number;
};

export function deriveFeatures(plan: Plan, addons: { aiOptimization?: boolean; prioritySupport?: boolean; analytics?: boolean; extraSeats?: number }) {
  const base: Record<Plan, Features> = {
    free:        { aiOptimization: false, prioritySupport: false, analytics: false, seats: 1 },
    starter:     { aiOptimization: true,  prioritySupport: false, analytics: true,  seats: 3 },
    pro:         { aiOptimization: true,  prioritySupport: true,  analytics: true,  seats: 5 },
    enterprise:  { aiOptimization: true,  prioritySupport: true,  analytics: true,  seats: 20 },
  };

  const f = { ...base[plan] };
  if (addons.aiOptimization !== undefined) f.aiOptimization = addons.aiOptimization;
  if (addons.prioritySupport !== undefined) f.prioritySupport = addons.prioritySupport;
  if (addons.analytics !== undefined) f.analytics = addons.analytics;
  if (addons.extraSeats) f.seats += addons.extraSeats;
  return f;
}
export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

export type Features = {
  aiOptimization: boolean;
  prioritySupport: boolean;
  analytics: boolean;
  seats: number;
};

export function deriveFeatures(plan: Plan, addons: { aiOptimization?: boolean; prioritySupport?: boolean; analytics?: boolean; extraSeats?: number }) {
  const base: Record<Plan, Features> = {
    free:        { aiOptimization: false, prioritySupport: false, analytics: false, seats: 1 },
    starter:     { aiOptimization: true,  prioritySupport: false, analytics: true,  seats: 3 },
    pro:         { aiOptimization: true,  prioritySupport: true,  analytics: true,  seats: 5 },
    enterprise:  { aiOptimization: true,  prioritySupport: true,  analytics: true,  seats: 20 },
  };

  const f = { ...base[plan] };
  if (addons.aiOptimization !== undefined) f.aiOptimization = addons.aiOptimization;
  if (addons.prioritySupport !== undefined) f.prioritySupport = addons.prioritySupport;
  if (addons.analytics !== undefined) f.analytics = addons.analytics;
  if (addons.extraSeats) f.seats += addons.extraSeats;
  return f;
}