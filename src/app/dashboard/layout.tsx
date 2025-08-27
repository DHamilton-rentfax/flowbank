
import { ReactNode } from "react";
import type { Metadata } from "next";
import HeaderDashboard from "../components/HeaderDashboard";
import Link from "next/link";
import { Banknote, Users, Sparkles, PieChart, LineChart, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "FlowBank — Dashboard",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link href="/dashboard" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
              <Banknote className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">FlowBank</span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/ai-advisor" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                  <Sparkles className="h-5 w-5" />
                  <span className="sr-only">AI Advisor</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">AI Advisor</TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/rules" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                  <PieChart className="h-5 w-5" />
                  <span className="sr-only">Allocation Rules</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Allocation Rules</TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/reporting" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                  <LineChart className="h-5 w-5" />
                  <span className="sr-only">Reporting</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Reporting</TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/teams" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Team Management</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Team Management</TooltipContent>
            </Tooltip>
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </nav>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <HeaderDashboard />
            <main className="p-4 sm:px-6 sm:py-0 space-y-4">
                {children}
            </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
