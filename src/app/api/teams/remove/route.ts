import { NextRequest, NextResponse } from "next/server";
import { getAdminApp } from "@/firebase/server";
import { getFirestore } from "firebase-admin/firestore";

const WORKSPACE_ID = "default"; // TODO: derive from session/workspace

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const db = getFirestore(getAdminApp());
    const ref = db.collection("workspaces").doc(WORKSPACE_ID).collection("members").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

    // Prevent deleting last Owner
    if (snap.data()?.role === "Owner") {
      const owners = await db
        .collection("workspaces").doc(WORKSPACE_ID)
        .collection("members").where("role","==","Owner").get();
      if (owners.size <= 1) return NextResponse.json({ error: "cannot remove the only Owner" }, { status: 400 });
    }

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "remove failed" }, { status: 500 });
  }
}