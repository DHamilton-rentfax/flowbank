
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
    }

    const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return res;
  } catch (err: any) {
    const code = err?.code || "app/invalid-credential";
    const msg = err?.message || "Failed to create session.";
    console.error("sessionLogin error:", code, msg);
    return NextResponse.json({ ok: false, error: msg, code }, { status: 401 });
  }
}
