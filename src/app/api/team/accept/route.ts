import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/server';

export const dynamic = 'force-dynamic'; // Ensure this runs server-side

export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();

    if (!token || !userId) {
      return NextResponse.json({ error: 'Missing token or userId' }, { status: 400 });
    }

    const db = getAdminDb();
    const inviteRef = db.collection('teamInvites').doc(token);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists) {
      return NextResponse.json({ error: 'Invalid or expired invite token' }, { status: 404 });
    }

    const inviteData = inviteDoc.data();

    // Optional: Check if the invite is for the correct user email if desired
    // if (inviteData?.email !== userEmail) {
    //   return NextResponse.json({ error: 'Invite not for this user' }, { status: 403 });
    // }

    // Add user to the team
    const teamRef = db.collection('teams').doc(inviteData?.teamId);
    const userRef = db.collection('users').doc(userId);

    const batch = db.batch();

    batch.update(userRef, {
      teamId: inviteData?.teamId,
      role: inviteData?.role || 'member', // Default role if not specified in invite
    });

    batch.update(teamRef, {
      members: db.FieldValue.arrayUnion({ uid: userId, role: inviteData?.role || 'member' }),
    });

    // Delete the invite document after successful acceptance
    batch.delete(inviteRef);

    await batch.commit();

    return NextResponse.json({ message: 'Invite accepted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
  }
}