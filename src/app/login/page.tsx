'use client';
import { useEffect, useRef, useState } from 'react';
import { loginWithGoogle, resolvePendingRedirect } from './login-actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const processing = useRef(false);

  useEffect(() => {
    // This handles the redirect result from Google
    resolvePendingRedirect().finally(() => setIsProcessing(false));
  }, []);

  useEffect(() => {
    // If user is logged in, redirect them away from the login page.
    if (!loading && user) {
      const nextUrl = searchParams.get('next') || '/dashboard';
      router.push(nextUrl);
    }
  }, [user, loading, router, searchParams]);


  const handleLogin = async () => {
    if (processing.current) return;
    processing.current = true;
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during sign-in.');
    } finally {
      processing.current = false;
    }
  };
  
  if (loading || isProcessing || user) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sign in to continue to your dashboard.
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6">
        <Button onClick={handleLogin} className="w-full" disabled={processing.current}>
          Continue with Google
        </Button>
      </div>
      <p className="mt-4 text-center text-sm text-gray-600">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}