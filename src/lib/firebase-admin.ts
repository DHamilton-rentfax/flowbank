'use server';

import { getAdminApp } from '@/firebase/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function getUserById(uid: string) {
  const app = await getAdminApp();
  return getAuth(app).getUser(uid);
}

export async function getDb() {
  const app = await getAdminApp();
  return getFirestore(app);
}