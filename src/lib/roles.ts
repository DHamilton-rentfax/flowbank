import { db } from '@/firebase/server';

export type Role = 'SUPERADMIN' | 'ADMIN' | 'USER';

export async function getUserRole(uid: string): Promise<Role> {
  const doc = await db.collection('users').doc(uid).get();
  const role = (doc.data()?.role as Role) || 'USER';
  return role;
}

export function isAdmin(role: Role) {
  return role === 'ADMIN' || role === 'SUPERADMIN';
}

export function isSuperAdmin(role: Role) {
  return role === 'SUPERADMIN';
}

export async function assertAdmin(uid: string) {
  const role = await getUserRole(uid);
  if (!isAdmin(role)) {
    const err: any = new Error('Forbidden: admin required');
    err.status = 403;
    throw err;
  }
  return role;
}