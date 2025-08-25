"use client";
import React, { useState } from "react";

type Props = {
  onInvite?: (email: string, role: string) => Promise<void> | void;
};

export default function InviteTeamMember({ onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (onInvite) {
        await onInvite(email.trim(), role);
      }
      setMsg("Invite sent.");
      setEmail("");
      setRole("member");
    } catch (err: any) {
      setMsg(err?.message || "Failed to send invite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border p-4 md:p-5 bg-white shadow-sm">
      <h3 className="text-base font-semibold">Invite Team Member</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="col-span-2 rounded-xl border px-3 py-2 outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border px-3 py-2 outline-none"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border px-4 py-2 bg-black text-white disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send Invite"}
        </button>
        {msg && <span className="text-sm text-gray-600">{msg}</span>}
      </div>
    </form>
  );
}