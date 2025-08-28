// src/app/(app)/teams/page.tsx
import { getAdminApp } from "@/firebase/server";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import TeamsClient from "./TeamsClient";

// Disable caching & RSC pre-rendering for always-fresh data
export const revalidate = 0;
export const dynamic = "force-dynamic";

const WORKSPACE_ID = "default"; // TODO: derive from session/workspace

// Firestore (server) shape:
type ServerMember = {
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  invitedAt?: Timestamp;
  joinedAt?: Timestamp;
};

// Client-safe shape (serializable):
export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  invitedAt?: string | null; // ISO string or null
  joinedAt?: string | null;  // ISO string or null
};

function tsToISO(ts?: Timestamp): string | null {
  return ts ? ts.toDate().toISOString() : null;
}

async function getMembers(): Promise<Member[]> {
  const db = getFirestore(getAdminApp());
  const snap = await db
    .collection("workspaces")
    .doc(WORKSPACE_ID)
    .collection("members")
    .orderBy("role")
    .orderBy("name")
    .get();

  return snap.docs.map((d) => {
    const data = d.data() as ServerMember;
    return {
      id: d.id,
      name: data.name,
      email: data.email,
      role: data.role,
      invitedAt: tsToISO(data.invitedAt),
      joinedAt: tsToISO(data.joinedAt),
    };
  });
}

export default async function TeamsPage() {
  const members = await getMembers();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Team</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Invite teammates and manage roles for your workspace.
        </p>
      </header>

      <TeamsClient initialMembers={members} />
    </section>
  );
}
