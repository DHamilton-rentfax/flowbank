
import { getAdminAuth } from '@/firebase/server';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// 5 days
const expiresIn = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
        return NextResponse.json({ error: 'ID token is required.' }, { status: 400 });
    }
    
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });
    
    cookies().set('__session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session Login Error:', error);
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
        cookies().delete('__session');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Session Logout Error:', error);
        return NextResponse.json({ error: 'Failed to clear session.' }, { status: 500 });
    }
}
