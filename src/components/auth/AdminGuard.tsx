'use client';

import React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = React.useState<'checking' | 'ok' | 'forbidden'>('checking');

  React.useEffect(() => {
    const unsub = onAuthStateChanged(authClient, async (user) => {
      if (!user) { // Use auth instead of authClient here
        router.replace('/login?next=/admin');
        return;
      }
      const idToken = await user.getIdToken();
      const res = await fetch('/api/auth/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (data?.ok && (data.role === 'ADMIN' || data.role === 'SUPERADMIN')) {
        setStatus('ok');
      } else {
        setStatus('forbidden');
        router.replace('/');
      }
    });
    return () => unsub();
  }, [router]);

  if (status === 'checking') {
    return <div className="p-6 text-sm text-gray-600">Checking access…</div>;
  }
  if (status === 'forbidden') {
    return null;
  }
  return <>{children}</>;
}