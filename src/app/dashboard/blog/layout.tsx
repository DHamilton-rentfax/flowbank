
"use client";

import { useApp } from "@/contexts/app-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userPlan, loadingData } = useApp();
  const router = useRouter();

  const userRole = userPlan?.role;
  const isAuthorized = userRole === 'admin' || userRole === 'editor';

  useEffect(() => {
    // If data has loaded and the user is not authorized, redirect them.
    if (!loadingData && !isAuthorized) {
      router.push('/dashboard');
    }
  }, [userRole, loadingData, isAuthorized, router]);

  // While loading or if not authorized yet, show a loading state
  // to prevent flashing the content.
  if (loadingData || !isAuthorized) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-20 w-full" />
                     <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }
  
  // If authorized, render the children (the page content)
  return <>{children}</>;
}
