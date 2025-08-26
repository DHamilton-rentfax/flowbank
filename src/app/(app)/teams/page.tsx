import { getAdminApp } from "@/firebase/server";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import TeamsClient from "./TeamsClient";

export const revalidate = 0;

const WORKSPACE_ID = "default"; // TODO: derive from session/workspace

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  invitedAt?: Timestamp;
  joinedAt?: Timestamp;
};

async function getMembers(): Promise<Member[]> {
  const db = getFirestore(getAdminApp());
  const snap = await db
    .collection("workspaces")
    .doc(WORKSPACE_ID)
    .collection("members")
    .orderBy("role")
    .orderBy("name")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Member[];
}

export default async function TeamsPage() {
  const members = await getMembers();
  return (<section className="space-y-6"><header><h1 className="text-xl font-semibold">Team</h1><p className="text-sm text-zinc-600 dark:text-zinc-400">Invite teammates and manage roles for your workspace.</p></header><TeamsClient initialMembers={members} /></section>);
}
import { getAdminApp } from "@/firebase/server";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import TeamsClient from "./TeamsClient";

export const revalidate = 0;

const WORKSPACE_ID = "default"; // TODO: derive from session/workspace

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  invitedAt?: Timestamp;
  joinedAt?: Timestamp;
};

async function getMembers(): Promise<Member[]> {
  const db = getFirestore(getAdminApp());
  const snap = await db
    .collection("workspaces")
    .doc(WORKSPACE_ID)
    .collection("members")
    .orderBy("role")
    .orderBy("name")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Member[];
}

export default async function TeamsPage() {
  const members = await getMembers();
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Team</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Invite teammates and manage roles for your workspace.</p>
      </header>

      <TeamsClient initialMembers={members} />
    </section>
  );
}