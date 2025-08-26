import { NextRequest, NextResponse } from "next/server";
import { getAdminApp } from "@/firebase/server";
import { getFirestore } from "firebase-admin/firestore";

const WORKSPACE_ID = "default"; // TODO: derive from session/workspace

export async function POST(req: NextRequest) {
  try {
    const { id, role } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (!role || !["Owner","Admin","Member"].includes(role)) return NextResponse.json({ error: "invalid role" }, { status: 400 });

    const db = getFirestore(getAdminApp());
    const ref = db.collection("workspaces").doc(WORKSPACE_ID).collection("members").doc(id);

    // Prevent removing the last Owner via role change (server-side guard)
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });
    const wasOwner = snap.data()?.role === "Owner";
    if (wasOwner && role !== "Owner") {
      const owners = await db
        .collection("workspaces").doc(WORKSPACE_ID)
        .collection("members").where("role","==","Owner").get();
      if (owners.size <= 1) return NextResponse.json({ error: "cannot demote the only Owner" }, { status: 400 });
    }

    await ref.set({ role }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "update failed" }, { status: 500 });
  }
}