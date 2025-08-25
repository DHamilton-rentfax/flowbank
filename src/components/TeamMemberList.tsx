"use client";
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
};
export type TeamMemberListProps = {
  members: TeamMember[];
};
export function TeamMemberList({ members }: TeamMemberListProps) {
  return (
    <ul className="divide-y rounded-md border">
      {members.map((m) => (
        <li key={m.id} className="flex items-center justify-between p-3">
          <div>
            <div className="font-medium">
 {m.name}
 </div>
            <div className="text-sm text-muted-foreground">{m.email}</div>
          </div>
          <span className="text-xs uppercase tracking-wide">{m.role}</span>
        </li>
      ))}
    </ul>
  );
}