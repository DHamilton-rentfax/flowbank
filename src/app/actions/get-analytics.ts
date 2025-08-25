"use server";

import { db } from '@/firebase/server';
import { getUserSession } from '@/lib/auth'

export async function getAnalyticsSnapshot() {
  const user = await getUserSession()
  if (!user) return null

  const docRef = db.collection('analytics').doc(user.uid)
  const snapshot = await docRef.get()

  return snapshot.exists ? snapshot.data() : null
}