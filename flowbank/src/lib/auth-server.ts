'use server';

import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/firebase/server";

export type SessionUser = {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  [k: string]: unknown;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookie = cookies().get("session")?.value;
  if (!cookie) return null;
  try {
    const auth = getAuth(getAdminApp());
    const decoded = await auth.verifySessionCookie(cookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      ...decoded,
    };
  } catch {
    return null;
  }
}

export async function requireSessionUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw new Error("NO_SESSION");
  return u;
}
