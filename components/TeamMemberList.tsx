"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Member {
  uid: string;
  email: string;
  role: string;
}

export function TeamMemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  type Role = "admin" | "user";
  type AnyRole = "admin" | "user" | "member";

  function normalizeRole(r: AnyRole): Role {
    return r === "member" ? "user" : r;
  }

  // Removed the handleRoleToggle function and replaced with onToggleRole logic below

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { getTeamMembers } = await import("@/app/actions/get-team-members");
        const membersList = await getTeamMembers();
        setMembers(membersList);
      } catch (err) {
        console.error("Failed to fetch team members:", err);
        toast.error("Failed to load team members.");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  async function onToggleRole(memberUid: string, currentRole: AnyRole) {
    const role = normalizeRole(currentRole);
    const newRole: Role = role === "admin" ? "user" : "admin";

    const { updateUserRole } = await import("@/app/actions/update-user-role");
    const result = await updateUserRole(memberUid, newRole);

    if (result?.success) {
      toast.success(`Role updated to ${newRole}`);
      // Update local state
      setMembers(members.map(m => m.uid === memberUid ? { ...m, role: newRole as AnyRole } : m));
    } else {
      toast.error(result?.error || "Failed to update role");
      toast.error("Failed to update role.");
    }
  }

  if (loading) return <p>Loading team members...</p>;

  return (
    <div className="mt-6 border p-4 rounded-xl space-y-4">
      <h2 className="text-lg font-semibold">Team Members</h2>
      <div className="overflow-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.uid} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{member.email}</td>
                <td className="p-2 border capitalize">{member.role}</td>
                <td className="p-2 border">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onToggleRole(member.uid, member.role as AnyRole)}
                  >
                    Make {member.role === 'admin' ? 'Member' : 'Admin'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}