
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const val = process.env.FIREBASE_ADMIN_CERT_B64 || '';
    
    // Don’t leak secrets: only report presence and size
    return NextResponse.json({
        hasVar: Boolean(val),
        length: val.length,
        // quick parse check (without exposing content)
        isLikelyBase64JSON: /^[A-Za-z0-9+/=]+$/.test(val) && val.length > 500
    });
}
