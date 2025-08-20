'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";

const InviteTeamMember = dynamic(() => import("@/components/team/InviteTeamMember"));
const TeamMemberList = dynamic(() => import("@/components/team/TeamMemberList"));

type TeamMember = {
  uid: string;
  email: string;
  role: string; // Use string as role can be 'admin' or 'member'
};

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

 if (!loading && user?.role !== 'admin') {
    router.push('/dashboard');
 }
  
  if (loading || user?.role !== 'admin') return <div className="p-4">Loading...</div>; // Show loading or redirect


  return (
    <div className="p-6">      <h1 className="text-2xl font-bold mb-4">Team Management</h1>
      {isAdmin ? (
        <>
          <InviteTeamMember />
          <TeamMemberList />
        </>
      ) : (
        <p>You do not have permission to view this page.</p>
      )}
    </div>
  );
}