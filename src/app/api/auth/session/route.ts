import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";


import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// ---------------- minimal Firebase Admin helper ----------------
function adminApp() {
  if (getApps().length === 0) {
    const credentialsJson = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";

    const credentials = JSON.parse(credentialsJson);
    initializeApp({ credential: cert(credentials) });
  }
  return getApps()[0];
}

function serverAuth() { return getAuth(adminApp()); }
// 5 days
const expiresIn = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
        return NextResponse.json({ error: 'ID token is required.' }, { status: 400 });
    }
    
    const sessionCookie = await serverAuth().createSessionCookie(idToken, { expiresIn });
    
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
