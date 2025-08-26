"use client";
import { useMemo, useState } from "react";
import type { Member } from "./page";

const ROLES = ["Member", "Admin", "Owner"] as const;

export default function TeamsClient({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Member["role"]>("Member");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, query]);

  const invite = async () => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return alert("Enter a valid email");
    setBusy(true);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ email, name, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invite failed");
      setMembers((m) => [data.member, ...m]);
      setEmail(""); setName(""); setRole("Member");
    } catch (e: any) {
      console.warn(e); alert(e.message || "Invite failed");
    } finally { setBusy(false); }
  };

  const changeRole = async (id: string, newRole: Member["role"]) => {
    setBusy(true);
    try {
      const res = await fetch("/api/teams/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ id, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMembers((list) => list.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    } catch (e: any) {
      console.warn(e); alert(e.message || "Update failed");
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this member?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/teams/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remove failed");
      setMembers((list) => list.filter((m) => m.id !== id));
    } catch (e: any) {
      console.warn(e); alert(e.message || "Remove failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      {/* Invite */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Invite</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" className="sm:col-span-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="teammate@company.com" type="email" className="sm:col-span-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={role} onChange={(e)=>setRole(e.target.value as Member["role"]) } className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent p-2">
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search team…" className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={invite} disabled={busy} className="rounded-md bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50">{busy ? "Working…" : "Send Invite"}</button>
        </div>
      </div>

      {/* Members table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Members</h3>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
            {filtered.map((m) => (
              <tr key={m.id}>
                <td className="py-2 font-medium">{m.name || "—"}</td>
                <td className="text-zinc-500">{m.email}</td>
                <td>
                  <select
                    value={m.role}
                    onChange={(e)=>changeRole(m.id, e.target.value as Member["role"]) }
                    className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-2 py-1"
                  >
                    {ROLES.map(r => <option key={r} value={r} disabled={m.role === "Owner" && r !== "Owner" && isOnlyOwner(members, m.id)}>{r}</option>)}
                  </select>
                </td>
                <td className="text-right">
                  <button
                    onClick={()=>remove(m.id)}
                    className="rounded-md border border-zinc-200 dark:border-zinc-800 px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    disabled={m.role === "Owner" && isOnlyOwner(members, m.id)}
                  >Remove</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="py-6 text-zinc-500" colSpan={4}>No members match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isOnlyOwner(list: Member[], id: string) {
  const owners = list.filter((m)=> m.role === "Owner");
  return owners.length === 1 && owners[0]?.id === id;
}
"use client";
import { useMemo, useState } from "react";
import type { Member } from "./page";

const ROLES = ["Member", "Admin", "Owner"] as const;

export default function TeamsClient({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Member["role"]>("Member");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, query]);

  const invite = async () => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return alert("Enter a valid email");
    setBusy(true);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ email, name, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invite failed");
      setMembers((m) => [data.member, ...m]);
      setEmail(""); setName(""); setRole("Member");
    } catch (e: any) {
      console.warn(e); alert(e.message || "Invite failed");
    } finally { setBusy(false); }
  };

  const changeRole = async (id: string, newRole: Member["role"]) => {
    setBusy(true);
    try {
      const res = await fetch("/api/teams/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ id, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMembers((list) => list.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    } catch (e: any) {
      console.warn(e); alert(e.message || "Update failed");
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this member?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/teams/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remove failed");
      setMembers((list) => list.filter((m) => m.id !== id));
    } catch (e: any) {
      console.warn(e); alert(e.message || "Remove failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      {/* Invite */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Invite</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" className="sm:col-span-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="teammate@company.com" type="email" className="sm:col-span-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={role} onChange={(e)=>setRole(e.target.value as Member["role"]) } className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent p-2">
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search team…" className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={invite} disabled={busy} className="rounded-md bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50">{busy ? "Working…" : "Send Invite"}</button>
        </div>
      </div>

      {/* Members table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Members</h3>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
            {filtered.map((m) => (
              <tr key={m.id}>
                <td className="py-2 font-medium">{m.name || "—"}</td>
                <td className="text-zinc-500">{m.email}</td>
                <td>
                  <select
                    value={m.role}
                    onChange={(e)=>changeRole(m.id, e.target.value as Member["role"]) }
                    className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-2 py-1"
                  >
                    {ROLES.map(r => <option key={r} value={r} disabled={m.role === "Owner" && r !== "Owner" && isOnlyOwner(members, m.id)}>{r}</option>)}
                  </select>
                </td>
                <td className="text-right">
                  <button
                    onClick={()=>remove(m.id)}
                    className="rounded-md border border-zinc-200 dark:border-zinc-800 px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    disabled={m.role === "Owner" && isOnlyOwner(members, m.id)}
                  >Remove</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="py-6 text-zinc-500" colSpan={4}>No members match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isOnlyOwner(list: Member[], id: string) {
  const owners = list.filter((m)=> m.role === "Owner");
  return owners.length === 1 && owners[0]?.id === id;
}