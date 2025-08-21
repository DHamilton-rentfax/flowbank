
"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardRouterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const plan = user.plan || "free";
    setRedirecting(true);

    switch (plan) {
        case 'starter':
          router.replace('/dashboard/starter');
          break;
        case 'pro':
          router.replace('/dashboard/pro');
          break;
        case 'enterprise':
          router.replace('/dashboard/enterprise');
          break;
      default:
        router.replace("/dashboard/free");
    };

  }, [user, loading, router]); // Depend on user, loading, and router
}

  return <LoadingSpinner />;
}


    