
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/firebase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    getAdminApp(); // Ensure the app is initialized
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
    }

    const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return res;
  } catch (err: any) {
    const code = err?.code || err?.errorInfo?.code || "app/invalid-credential";
    const msg = err?.message || err?.errorInfo?.message || "Failed to create session.";
    console.error("sessionLogin error:", code, msg);
    return NextResponse.json({ ok: false, error: msg, code }, { status: 401 });
  }
}
