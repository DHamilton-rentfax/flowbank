"use server";

import { getAdminDb } from "@/firebase/server";
import { logAuditEvent } from "@/app/actions/log-audit";

export async function inviteTeamMember(email: string, role: string) {
  const db = getAdminDb();

  // Generate a unique invite ID
  const inviteRef = db.collection("invites").doc();
  const inviteId = inviteRef.id;

  const invite = {
    id: inviteId, // Store the ID in the document
    email,
    role,
    createdAt: Date.now(),
  };

 await inviteRef.set(invite);

  // Construct invite link and send email
  const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${inviteId}`;
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/send-invite`, {
    method: 'POST',
    body: JSON.stringify({ email, inviteLink }),
  });

  // ✅ Log action
  await logAuditEvent("INVITE_SENT", { email, role });
}