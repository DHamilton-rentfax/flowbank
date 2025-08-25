"use server";

import 'server-only';
import { getAdminDb } from '@/firebase/server';

export async function getUserRole(uid: string): Promise<'admin' | 'member' | 'owner' | null> {
  try {
    const doc = await getAdminDb().collection('users').doc(uid).get();
    const data = doc.data();
    return data?.role || null;
  } catch (error) {
    console.error('getUserRole error:', error);
    return null;
  }
}