"use client";

import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface TeamMemberListProps {
  members: TeamMember[];
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({ members }) => {
  return (
    <div className="rounded-2xl border p-4 md:p-5 bg-white shadow-sm">
      <h3 className="text-base font-semibold mb-4">Team Members</h3>
      {members.length === 0 ? (
        <p className="text-gray-500">No team members found.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between">
              <span className="font-medium">{member.name}</span>
              <span className="text-sm text-gray-600">{member.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamMemberList;