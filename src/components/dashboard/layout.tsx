
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Settings, BarChart3, LogOut, PenSquare, MessageSquare, CreditCard, Bot, BrainCircuit, Shield, Gift, Handshake } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppProvider, useApp } from "@/contexts/app-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Chat = dynamic(() => import('@/components/chatbot/chat').then(mod => mod.Chat), {
    loading: () => <Skeleton className="h-full" />,
    ssr: false
});


function DashboardNav({
    children,
  }: {
    children: React.ReactNode;
  }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { userPlan } = useApp();
  
  const userRole = userPlan?.role || 'user';

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
        return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    }
    if (email) {
        return email.substring(0, 2).toUpperCase();
    }
    return "?";
  };
  
  const getDisplayName = () => {
    if (user?.displayName) {
        return user.displayName;
    }
    if (user?.email) {
        return user.email;
    }
    return "User";
  }

  return (
      <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Logo className="size-7 text-primary" />
                <h1 className="text-xl font-semibold">FlowBank</h1>
              </div>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                      <Link href="/dashboard">
                          <Home />
                          <span>Dashboard</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/coach')}>
                      <Link href="/dashboard/coach">
                          <BrainCircuit />
                          <span>AI Coach</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/partners')}>
                      <Link href="/dashboard/partners">
                          <Handshake />
                          <span>Partners</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/offers')}>
                      <Link href="/dashboard/offers">
                          <Gift />
                          <span>Offers</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/payments')}>
                      <Link href="/dashboard/payments">
                          <CreditCard />
                          <span>Payments</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/reporting')}>
                      <Link href="/dashboard/reporting">
                          <BarChart3 />
                          <span>Reporting</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              {['admin', 'editor'].includes(userRole) && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/blog')}>
                        <Link href="/dashboard/blog">
                            <PenSquare />
                            <span>Blog</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/feedback')}>
                      <Link href="/dashboard/feedback">
                          <MessageSquare />
                          <span>Feedback</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/settings')}>
                      <Link href="/dashboard/settings">
                          <Settings />
                          <span>Settings</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
               {userRole === 'admin' && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/admin')}>
                        <Link href="/dashboard/admin">
                            <Shield />
                            <span>Admin</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
            <SidebarFooter>
               <div className="flex items-center gap-2 p-2 rounded-md bg-sidebar-accent">
                 <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(user?.displayName, user?.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{getDisplayName()}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="shrink-0">
                    <LogOut />
                </Button>
               </div>
            </SidebarFooter>
        </Sidebar>
         <SidebarInset>
            <header className="flex items-center justify-between p-4 border-b">
                 <SidebarTrigger />
                 <h1 className="text-xl font-semibold capitalize">{pathname.substring(pathname.lastIndexOf('/') + 1).replace('-', ' ') || 'Dashboard'}</h1>
                 <div></div>
            </header>
            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
             <Popover>
                <PopoverTrigger asChild>
                     <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg">
                        <Bot />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 h-96 p-0 mr-4 mb-2" side="top" align="end">
                    <Suspense fallback={<div className="flex items-center justify-center h-full"><p>Loading Chat...</p></div>}>
                        <Chat />
                    </Suspense>
                </PopoverContent>
            </Popover>
        </SidebarInset>
      </SidebarProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AppProvider>
        <DashboardNav>
            {children}
        </DashboardNav>
    </AppProvider>
  );
}
