import { NextRequest, NextResponse } from "next/server";
import { getAdminApp } from "@/firebase/server";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const WORKSPACE_ID = "default"; // TODO: derive from session/workspace

export async function POST(req: NextRequest) {
  try {
    const { email, name, role } = await req.json();
    if (!email || typeof email !== "string") return NextResponse.json({ error: "email required" }, { status: 400 });
    const r = (role || "Member") as "Owner" | "Admin" | "Member";
    if (!["Owner","Admin","Member"].includes(r)) return NextResponse.json({ error: "invalid role" }, { status: 400 });

    const db = getFirestore(getAdminApp());
    const col = db.collection("workspaces").doc(WORKSPACE_ID).collection("members");

    // If already a member, upsert name/role
    const existing = await col.where("email", "==", email).limit(1).get();
    if (!existing.empty) {
      const ref = existing.docs[0].ref;
      await ref.set({ name: name || existing.docs[0].data().name || null, role: r }, { merge: true });
      const out = { id: ref.id, ...(await ref.get()).data() } as any;
      return NextResponse.json({ ok: true, member: { id: ref.id, ...out } });
    }

    const doc = await col.add({ email, name: name || null, role: r, invitedAt: Timestamp.fromDate(new Date()) });
    const saved = await doc.get();
    return NextResponse.json({ ok: true, member: { id: doc.id, ...(saved.data() as any) } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invite failed" }, { status: 500 });
  }
}