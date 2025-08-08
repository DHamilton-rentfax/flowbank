
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase/server";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json(); 
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }
    const auth = getAdminAuth();

    const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    
    const isProd = process.env.NODE_ENV === 'production';

    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/",
    });
    
    return res;
  } catch (error: any) {
    console.error("Session login error:", error?.code || error?.message || error);
    return NextResponse.json({ ok: false, error: "Failed to create session." }, { status: 401 });
  }
}
