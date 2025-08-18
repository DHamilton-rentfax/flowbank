
'use server';

import { getAdminAuth, getAdminDb } from '@/firebase/server';
import { headers } from 'next/headers';
import { firestore } from 'firebase-admin';

// Helper to get the current user's UID from the session
const getUserId = async () => {
  const idToken = headers().get('Authorization')?.split('Bearer ')[1];
  if (!idToken) {
    throw new Error('User not authenticated');
  }
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid authentication token.');
  }
};

// In a real app, the teamId would be associated with the user.
// For this prototype, we'll use a hardcoded team ID for simplicity.
const MOCK_TEAM_ID = 'defaultTeam';

async function getOrCreateTeam(userId: string) {
    const db = getAdminDb();
    const teamRef = db.collection('teams').doc(MOCK_TEAM_ID);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
        const user = await getAdminAuth().getUser(userId);
        await teamRef.set({
            name: `${user.displayName || user.email}'s Team`,
            owner: userId,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });
        await teamRef.collection('members').doc(userId).set({
            email: user.email,
            role: 'owner',
            status: 'active',
            joinedAt: firestore.FieldValue.serverTimestamp(),
        });
    }
    return teamRef;
}


export async function inviteTeamMember(email: string) {
  const userId = await getUserId();
  const db = getAdminDb();
  
  const teamRef = await getOrCreateTeam(userId);
  const teamSnap = await teamRef.get();
  const teamData = teamSnap.data();

  if (teamData?.owner !== userId) {
    return { success: false, error: 'Only the team owner can invite members.' };
  }
  
  const userSnap = await db.collection('users').doc(userId).get();
  const userData = userSnap.data();
  // Base seats on Pro plan is 5, otherwise 1. This could be made more dynamic.
  const proPlanBaseSeats = (userData?.plan?.id === 'pro' || userData?.plan?.id === 'enterprise') ? 5 : 1;
  const extraSeats = userData?.addons?.extra_seats || 0;
  const maxSeats = proPlanBaseSeats + extraSeats;

  const membersSnap = await teamRef.collection('members').get();
  const invitesSnap = await teamRef.collection('invites').where('status', '==', 'invited').get();

  if (membersSnap.size + invitesSnap.size >= maxSeats) {
    return { success: false, error: 'Seat limit reached. Please upgrade or add more seats.' };
  }

  const existingMemberQuery = await teamRef.collection('members').where('email', '==', email).get();
  if (!existingMemberQuery.empty) {
    return { success: false, error: 'This user is already a member.' };
  }
  const existingInviteQuery = await teamRef.collection('invites').where('email', '==', email).where('status', '==', 'invited').get();
   if (!existingInviteQuery.empty) {
    return { success: false, error: 'This user already has a pending invitation.' };
  }

  // Using email as ID for simplicity to prevent duplicate invites.
  const inviteId = Buffer.from(email).toString('base64');
  const inviteData = {
    email,
    role: 'member',
    status: 'invited',
    invitedAt: firestore.FieldValue.serverTimestamp(),
    invitedBy: userId,
  };
  await teamRef.collection('invites').doc(inviteId).set(inviteData);
  
  await teamRef.collection('auditLogs').add({
      type: 'MEMBER_INVITED',
      timestamp: firestore.FieldValue.serverTimestamp(),
      actorId: userId,
      details: { invitedEmail: email }
  });

  return { success: true, message: `Invitation sent to ${email}.` };
}

export async function acceptTeamInvitation(token: string) {
    const userId = await getUserId();
    const db = getAdminDb();
    
    // In a real app, the token would be a secure, unique ID. Here we use the base64 email.
    const inviteId = token; 
    const teamRef = db.collection('teams').doc(MOCK_TEAM_ID);
    const inviteRef = teamRef.collection('invites').doc(inviteId);
    const inviteSnap = await inviteRef.get();

    if (!inviteSnap.exists) {
        return { success: false, error: 'Invitation not found or expired.' };
    }

    const inviteData = inviteSnap.data();
    const user = await getAdminAuth().getUser(userId);

    if (user.email !== inviteData?.email) {
        return { success: false, error: 'This invitation is for a different email address.' };
    }
    
    const memberRef = teamRef.collection('members').doc(userId);

    await db.runTransaction(async (transaction) => {
        transaction.set(memberRef, {
            email: user.email,
            role: inviteData?.role || 'member',
            status: 'active',
            joinedAt: firestore.FieldValue.serverTimestamp(),
        });
        transaction.delete(inviteRef);
        transaction.create(teamRef.collection('auditLogs').doc(), {
            type: 'MEMBER_JOINED',
            timestamp: firestore.FieldValue.serverTimestamp(),
            actorId: userId,
            details: { joinedEmail: user.email, joinedId: userId }
        });
    });

    await db.collection('users').doc(userId).set({ teamId: MOCK_TEAM_ID }, { merge: true });

    return { success: true, message: `Successfully joined the team.` };
}

export async function getTeamInfo() {
    const userId = await getUserId();
    const db = getAdminDb();

    const teamRef = await getOrCreateTeam(userId);
    const teamSnap = await teamRef.get();
    const teamData = teamSnap.data();

    const membersSnap = await teamRef.collection('members').get();
    const members = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const invitesSnap = await teamRef.collection('invites').get();
    const invites = invitesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const userSnap = await db.collection('users').doc(userId).get();
    const userData = userSnap.data();

    const proPlanBaseSeats = (userData?.plan?.id === 'pro' || userData?.plan?.id === 'enterprise') ? 5 : 1;
    const extraSeats = userData?.addons?.extra_seats || 0;
    const maxSeats = proPlanBaseSeats + extraSeats;
    
    return {
        id: teamRef.id,
        ...teamData,
        members,
        invites,
        seats: {
            used: members.length,
            total: maxSeats,
        }
    };
}

export async function removeTeamMember(memberId: string) {
    const userId = await getUserId();
    const db = getAdminDb();

    const teamRef = db.collection('teams').doc(MOCK_TEAM_ID);
    const teamSnap = await teamRef.get();

    if (teamSnap.data()?.owner !== userId) {
        return { success: false, error: 'Only the team owner can remove members.' };
    }
    if (memberId === userId) {
        return { success: false, error: 'The team owner cannot be removed.' };
    }
    
    const memberRef = teamRef.collection('members').doc(memberId);
    const memberDoc = await memberRef.get();
    if (!memberDoc.exists) {
         return { success: false, error: 'Member not found.' };
    }
    const memberEmail = memberDoc.data()?.email;
    
    await memberRef.delete();
    
    await teamRef.collection('auditLogs').add({
        type: 'MEMBER_REMOVED',
        timestamp: firestore.FieldValue.serverTimestamp(),
        actorId: userId,
        details: { removedEmail: memberEmail, removedId: memberId }
    });

    return { success: true, message: 'Member removed successfully.' };
}

export async function getTeamAuditLogs() {
    const userId = await getUserId();
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(userId).get();
    const teamId = userDoc.data()?.teamId || MOCK_TEAM_ID; // Fallback to mock for owner

    if (!teamId) {
        return { logs: [] };
    }

    const logsSnap = await db.collection('teams').doc(teamId).collection('auditLogs')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

    const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { logs };
}
