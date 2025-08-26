import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ authed: false }, { status: 401 });
  return NextResponse.json({ authed: true, user });
}
