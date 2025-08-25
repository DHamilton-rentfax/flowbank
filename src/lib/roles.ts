/**
 * src/lib/roles.ts
 *
 * Lightweight helpers for role checks and gating.
 * These operate on decoded token/customClaims objects you already have.
 */

export type Claims = {
  role?: string;
  admin?: boolean;
  [key: string]: any;
};

export function isSuperAdmin(claims?: Claims | null): boolean {
  if (!claims) return false;
  return claims.role === "super_admin" || claims.role === "owner";
}

export function isAdmin(claims?: Claims | null): boolean {
  if (!claims) return false;
  return isSuperAdmin(claims) || claims.role === "admin" || claims.admin === true;
}

export function hasRole(claims: Claims | null | undefined, roles: string | string[]): boolean {
  if (!claims) return false;
  const list = Array.isArray(roles) ? roles : [roles];
  return list.includes(claims.role || "");
}

export function requireAdmin(claims?: Claims | null) {
  if (!isAdmin(claims)) {
    throw new Error("Permission denied: admin only.");
  }
}

export function requireRole(claims: Claims | null | undefined, roles: string | string[]) {
  if (!hasRole(claims, roles) && !isAdmin(claims)) {
    throw new Error("Permission denied: insufficient role.");
  }
}

// Example UI gating helper
export function planOverridesByRole(claims?: Claims | null) {
  // Super admins bypass most gates in dashboards
  if (isSuperAdmin(claims)) {
    return { externalAccountsLimit: "unlimited", aiAdvisorFull: true, prioritySupport: true };
  }
  if (isAdmin(claims)) {
    return { externalAccountsLimit: 5, aiAdvisorFull: true, prioritySupport: true };
  }
  return {};
}