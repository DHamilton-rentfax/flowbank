
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

function adminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const credentialsB64 = process.env.FIREBASE_ADMIN_CERT_B64;
  if (!credentialsB64) {
    throw new Error("FIREBASE_ADMIN_CERT_B64 environment variable is not set. Cannot initialize Firebase Admin SDK.");
  }

  try {
    const credentialsJson = Buffer.from(credentialsB64, "base64").toString("utf8");
    const credentials = JSON.parse(credentialsJson);
    return initializeApp({ credential: cert(credentials) });
  } catch (e: any) {
    throw new Error(`Failed to parse or initialize Firebase Admin credentials: ${e.message}`);
  }
}

function serverAuth() { 
  try {
    const app = adminApp();
    return getAuth(app);
  } catch (e: any) {
    console.error("Firebase Admin Initialization Error:", e.stack);
    // Re-throw the error to be caught by the route handler's catch block
    throw e;
  }
}

// 5 days
const expiresIn = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
        return NextResponse.json({ error: 'ID token is required.' }, { status: 400 });
    }
    
    const auth = serverAuth();
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    cookies().set('__session', sessionCookie, {
        maxAge: expiresIn / 1000, // maxAge is in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session Login Error:', error);
    // Provide a more specific error message if it's an initialization issue
    const errorMessage = error.message.includes("FIREBASE_ADMIN_CERT_B64")
      ? error.message
      : 'Failed to create session due to an internal server error.';
      
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
