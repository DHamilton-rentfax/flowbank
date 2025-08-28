"use server";

import { adminApp } from "@/firebase/server"; // server-only file
import { getFirestore } from "firebase-admin/firestore";

export async function getAnalyticsSnapshot() {
  const db = getFirestore(adminApp);
  // ...query Firestore...
  return { activeUsers: 0, paidUsers: 0 }; // real data here
}
