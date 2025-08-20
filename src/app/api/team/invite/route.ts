// File: src/app/api/team/invite/route.ts
import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/firebase/server';
import { z } from 'zod';
import { firestore } from 'firebase-admin'; // Explicitly import firestore

export const dynamic = 'force-dynamic';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'admin']).default('member'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role } = InviteSchema.parse(body);

    const db = getAdminDb();
    const auth = getAdminAuth();

    // TODO: Implement admin check using the authenticated user's UID
    // const userId = // Get authenticated user ID from token or session
    // const userDoc = await db.collection('users').doc(userId).get();
    // if (userDoc.data()?.role !== 'admin') {
    //   return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    // }

    // Check if user already exists or has a pending invite
    const existingUser = await auth.getUserByEmail(email).catch(() => null);
    if (existingUser) {
      return NextResponse.json({ ok: false, error: 'User with this email already exists.' }, { status: 400 });
    }

    const existingInvite = await db.collection('team_invites').where('email', '==', email).where('status', '==', 'pending').get();
    if (!existingInvite.empty) {
      return NextResponse.json({ ok: false, error: 'An invite for this email is already pending.' }, { status: 400 });
    }

    const inviteRef = db.collection('team_invites').doc();
    const inviteId = inviteRef.id;

    await inviteRef.set({
      email,
      role,
      status: 'pending',
      createdAt: firestore.FieldValue.serverTimestamp(), // Use server timestamp
    });

    // Log audit event (Assuming userId is available from authentication context)
    // const userId = // Get authenticated user ID
    // await db.collection('team_audit').add({
    //   type: 'INVITE_SENT',
    //   inviteId: inviteId,
    //   invitedEmail: email,
    //   invitedRole: role,
    //   sentBy: userId, // The admin who sent the invite
    //   timestamp: firestore.FieldValue.serverTimestamp(),
    // });


    // TODO: Implement sending invite email with a link containing the inviteId

    return NextResponse.json({ ok: true, inviteId });
  } catch (error) {
    console.error('Invite POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}