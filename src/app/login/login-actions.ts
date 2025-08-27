'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  UserCredential,
} from 'firebase/auth';
import { getClientAuth } from '@/firebase/client';

async function handleSuccessfulLogin(credential: UserCredential) {
    const idToken = await credential.user.getIdToken(true);
    const res = await fetch('/api/sessionLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Session login failed');
    }
    // The redirect is now handled by the page component after auth state changes
}


export async function loginWithGoogle(): Promise<void> {
  const auth = getClientAuth();
  const provider = new GoogleAuthProvider();

  // If the app is framed (IDE preview), popups will fail: use redirect
  const inIframe =
    typeof window !== 'undefined' && window.top !== window.self;

  if (inIframe) {
    await signInWithRedirect(auth, provider);
  } else {
    const credential = await signInWithPopup(auth, provider);
    await handleSuccessfulLogin(credential);
  }
}

// Call this once in a client component to resolve stuck pending promises
export async function resolvePendingRedirect(): Promise<void> {
  const auth = getClientAuth();
  try {
    const credential = await getRedirectResult(auth); // settles any pending redirect from prior attempt
    if (credential) {
        await handleSuccessfulLogin(credential);
    }
  } catch (error){
    // This can happen if there's no redirect result to process, which is normal.
    console.log("No redirect result to process or an error occurred.", error);
  }
}