ts
export const EXTERNAL_ACCOUNT_LIMITS: Record<string, number | 'unlimited'> = {
  free: 0,
  starter: 1,
  pro: 5,
  enterprise: 'unlimited',
  superadmin: 'unlimited',
};

export function canAddExternalAccount(plan: string, currentCount: number, isSuperAdmin: boolean): boolean {
  if (isSuperAdmin) return true;
  const limit = EXTERNAL_ACCOUNT_LIMITS[plan];
  if (limit === 'unlimited') return true;
  return currentCount < (limit ?? 0);
}