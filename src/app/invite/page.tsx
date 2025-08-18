'use client';

import { Suspense } from 'react';
import AcceptInvitePageContent from './AcceptInvitePageContent';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function AcceptInviteSkeleton() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Accept Invitation</CardTitle>
                    <CardDescription>Loading and verifying your invitation...</CardDescription>
                </CardHeader>
                <div className="p-6 pt-0">
                    <Skeleton className="h-10 w-full" />
                </div>
            </Card>
        </div>
    )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInviteSkeleton />}>
      <AcceptInvitePageContent />
    </Suspense>
  );
}
