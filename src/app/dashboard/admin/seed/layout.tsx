
"use client";

import { useApp } from "@/contexts/app-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function AdminSeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userPlan, loadingData } = useApp();
  const router = useRouter();

  const userRole = userPlan?.role;
  const isAuthorized = userRole === 'admin';

  useEffect(() => {
    if (!loadingData && !isAuthorized) {
      router.push('/dashboard');
    }
  }, [userRole, loadingData, isAuthorized, router]);

  if (loadingData || !isAuthorized) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
  }
  
  return <>{children}</>;
}
