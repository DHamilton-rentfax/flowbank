"use server";

import { getAdminDb, getAdminAuth } from "@/firebase/server";
import { cookies } from "next/headers";

export async function logAuditEvent(type: string, details: any) {
  const db = getAdminDb();
  const sessionCookie = cookies().get("__session")?.value || "";
  const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true).catch(() => null);
  if (!decoded) return;

  const log = {
    type,
    details,
    actorUid: decoded.uid,
    timestamp: Date.now(),
  };

  await db.collection("auditLogs").add(log);
}