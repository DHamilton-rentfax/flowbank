
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const hasVar = !!process.env.FIREBASE_ADMIN_CERT_B64;
    const length = process.env.FIREBASE_ADMIN_CERT_B64?.length || 0;

    return NextResponse.json({ hasVar, length });
}
