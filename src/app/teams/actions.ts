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
        await teamRef.set({
            name: 'My Team',
            owner: userId,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });
         // Add owner as the first member
        await teamRef.collection('members').doc(userId).set({
            email: (await getAdminAuth().getUser(userId)).email,
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

  // Determine seat limit: Pro plan base seats + purchased extra seats.
  const proPlanBaseSeats = userData?.plan?.id === 'pro' ? 5 : 1;
  const extraSeats = userData?.addons?.extra_seats || 0;
  const maxSeats = proPlanBaseSeats + extraSeats;

  const membersSnap = await teamRef.collection('members').get();

  if (membersSnap.size >= maxSeats) {
    return { success: false, error: 'Seat limit reached. Please upgrade or add more seats.' };
  }

  // Check if user is already invited or a member
  const existingMemberQuery = await teamRef.collection('members').where('email', '==', email).get();
  if (!existingMemberQuery.empty) {
    return { success: false, error: 'This user is already a member or has a pending invitation.' };
  }

  // Create an invitation document. We'll use the email as a temporary ID.
  const inviteId = Buffer.from(email).toString('base64');
  await teamRef.collection('invites').doc(inviteId).set({
    email,
    role: 'member',
    status: 'invited',
    invitedAt: firestore.FieldValue.serverTimestamp(),
    invitedBy: userId,
  });

  // In a real app, you would send an email with an invite link.
  // The link would be like: /invite?token={inviteId}
  console.log(`Invite created for ${email}. Invite ID: ${inviteId}`);

  return { success: true, message: `Invitation sent to ${email}.` };
}

export async function acceptTeamInvitation(inviteId: string) {
    const userId = await getUserId();
    const db = getAdminDb();
    
    const inviteRef = db.collection('teams').doc(MOCK_TEAM_ID).collection('invites').doc(inviteId);
    const inviteSnap = await inviteRef.get();

    if (!inviteSnap.exists) {
        return { success: false, error: 'Invitation not found or expired.' };
    }

    const inviteData = inviteSnap.data();
    const user = await getAdminAuth().getUser(userId);

    if (user.email !== inviteData?.email) {
        return { success: false, error: 'This invitation is for a different email address.' };
    }

    const teamRef = db.collection('teams').doc(MOCK_TEAM_ID);

    // Add user to the members subcollection
    await teamRef.collection('members').doc(userId).set({
        email: user.email,
        role: inviteData?.role || 'member',
        status: 'active',
        joinedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Delete the invitation so it can't be used again
    await inviteRef.delete();

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

    const proPlanBaseSeats = userData?.plan?.id === 'pro' ? 5 : 1;
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
