// Server component – lists Firebase users as team members.
import { adminAuth } from "../../../firebase/server"; // relative to /src/app/admin/users/page.tsx
import { TeamMemberList, type TeamMember } from "../../../components/TeamMemberList";
import React from "react";

function toTeamMember(u: any): TeamMember {
  const role =
    (u?.customClaims?.role as TeamMember["role"]) ?? ("member" as const);
  return {
    id: String(u.uid),
    name: u.displayName || (u.email ? String(u.email).split("@")[0] : "User"),
    email: u.email ?? "",
    role,
  };
}

export default async function AdminUsersPage() {
  const { users } = await adminAuth.listUsers(1000);
  const members = users.map(toTeamMember);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Team Members</h1>
      <TeamMemberList members={members} />
    </div>
  );
}