
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeft, LogOut, Settings, LayoutDashboard, Sparkles, PieChart, Users, LineChart, Banknote } from "lucide-react";
import { createPortalSession } from "@/app/actions/create-portal-session";
import { toast } from "react-hot-toast";

export default function HeaderDashboard() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  const handleManageBilling = async () => {
    try {
        const { url } = await createPortalSession();
        router.push(url);
    } catch (error) {
        const err = error as Error;
        toast.error(err.message || "Failed to open billing portal.");
        console.error("Billing portal error:", err);
    }
  }

  const NavLinks = () => (
    <>
      <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <LayoutDashboard className="h-4 w-4" />
          Overview
      </Link>
      <Link href="/dashboard/ai-advisor" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <Sparkles className="h-4 w-4" />
          AI Advisor
      </Link>
      <Link href="/rules" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <PieChart className="h-4 w-4" />
          Allocation Rules
      </Link>
      <Link href="/reporting" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <LineChart className="h-4 w-4" />
          Reporting
      </Link>
      <Link href="/teams" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <Users className="h-4 w-4" />
          Team
      </Link>
      <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <Settings className="h-4 w-4" />
          Settings
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                 <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link href="/dashboard" className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                       <Banknote className="h-5 w-5 transition-all group-hover:scale-110" />
                       <span className="sr-only">FlowBank</span>
                    </Link>
                    <NavLinks />
                </nav>
            </SheetContent>
        </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Placeholder for a search bar if needed */}
      </div>
      <Button variant="outline" onClick={handleManageBilling}>Manage Billing</Button>
      <Button variant="outline" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Log out</span>
      </Button>
    </header>
  );
}
