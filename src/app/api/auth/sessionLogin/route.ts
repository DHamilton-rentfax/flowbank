
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
    }

    const auth = getAdminAuth();
    const expiresIn = 1000 * 60 * 60 * 24 * 5;

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: isProd,   // keep false in dev if you’re not on https locally
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return res;
  } catch (err: any) {
    // surface firebase admin error details
    const code = err?.code || err?.errorInfo?.code || "unknown";
    const msg = err?.message || err?.errorInfo?.message || "Failed to create session.";
    console.error("sessionLogin error:", code, msg);
    return NextResponse.json({ ok: false, error: msg, code }, { status: 401 });
  }
}
