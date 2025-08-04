
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Settings, BarChart3, LogOut, PenSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppProvider } from "@/contexts/app-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
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

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AppProvider>
      <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Logo className="size-7 text-primary" />
                <h1 className="text-xl font-semibold">Flow Bank</h1>
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
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/reporting')}>
                      <Link href="/reporting">
                          <BarChart3 />
                          <span>Reporting</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/blog')}>
                      <Link href="/dashboard/blog">
                          <PenSquare />
                          <span>Blog</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')}>
                      <Link href="/settings">
                          <Settings />
                          <span>Settings</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarFooter>
               <div className="flex items-center gap-2 p-2 rounded-md bg-sidebar-accent">
                 <Avatar className="h-9 w-9">
                    {/* Placeholder for user avatar */}
                    <AvatarFallback>{getInitials(user.displayName, user.email)}</AvatarFallback>
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
                 <h1 className="text-xl font-semibold capitalize">{pathname.substring(1).split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
                 <div></div>
            </header>
            <main className="p-4 sm:p-6 lg:p-8">
              {children}
            </main>
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  );
}
