
"use client";

import type { TeamMember } from "@/demo/sampleData";

export default function DemoTeam({ team }: { team: TeamMember[] }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-semibold">Team</div>
      <ul className="grid gap-3 md:grid-cols-3">
        {team.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-gray-500">{m.role}</div>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{m.role}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
