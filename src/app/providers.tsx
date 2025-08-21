'use client';
import { AuthProvider } from '@/hooks/use-auth';
import { AppProvider } from '@/contexts/app-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
 return (
 <AuthProvider>
 <AppProvider>{children}</AppProvider>
 </AuthProvider>
 );
}