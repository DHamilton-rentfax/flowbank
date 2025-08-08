
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase/server";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json(); 
    const auth = getAdminAuth();

    const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    
    res.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/",
    });
    
    return res;
  } catch (error) {
    console.error("Session login error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create session." }, { status: 401 });
  }
}
