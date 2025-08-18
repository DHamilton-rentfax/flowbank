'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { acceptTeamInvitation } from '@/app/teams/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState('loading'); // loading, unauthenticated, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
        setStatus('error');
        setErrorMessage('No invitation token provided.');
        return;
    }

    if (!user) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('processing');
    startTransition(async () => {
      const { success, error, message } = await acceptTeamInvitation(token);
      if (success) {
        setStatus('success');
        toast({ title: "Welcome!", description: message });
        router.push('/dashboard');
      } else {
        setStatus('error');
        setErrorMessage(error || 'Failed to accept invitation.');
        toast({ title: 'Error', description: error, variant: 'destructive' });
      }
    });

  }, [user, authLoading, token, router, toast]);

  const renderContent = () => {
    switch (status) {
      case 'unauthenticated':
        return (
          <>
            <CardDescription>Please sign in or create an account to accept your team invitation.</CardDescription>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/login?next=/invite?token=${token}`}>Sign In to Accept</Link>
              </Button>
            </CardContent>
          </>
        );
      case 'success':
        return <CardDescription>Success! Redirecting you to the dashboard...</CardDescription>;
      case 'error':
        return <CardDescription className="text-destructive">{errorMessage}</CardDescription>;
      default:
        return <CardDescription>Loading and verifying your invitation...</CardDescription>;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
        </CardHeader>
        {renderContent()}
      </Card>
    </div>
  );
}
