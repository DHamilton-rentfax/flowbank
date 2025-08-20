import { NextResponse } from "next/server";
import { adminDb } from "@/src/firebase/server"; // adjust path if needed

export async function GET() {
  try {
    // Try a simple call to verify admin works
    const time = new Date().toISOString();
    const collections = await adminDb.listCollections();

    return NextResponse.json({
      ok: true,
      time,
      collections: collections.map(c => c.id),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}



// src/app/api/health/admin/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/src/firebase/server"; // adjust path if needed

export async function GET() {
  try {
    // Try a simple call to verify admin works
    const time = new Date().toISOString();
    const collections = await adminDb.listCollections();

    return NextResponse.json({
      ok: true,
      time,
      collections: collections.map(c => c.id),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}