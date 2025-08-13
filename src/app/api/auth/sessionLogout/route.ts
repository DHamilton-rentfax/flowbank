
import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.FIREBASE_AUTH_COOKIE_NAME || '__session';

export async function POST(req: Request) {
    if (req.method !== 'POST') {
        return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
    }
    
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: "lax", 
        maxAge: 0, 
        path: "/" 
    });
    return res;
}
