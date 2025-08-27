"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from "react";
import AppProvider from '@/providers/AppProvider';

const AuthProvider = dynamic(() => import('@/providers/AuthProvider'), {
  ssr: false,
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );
}
