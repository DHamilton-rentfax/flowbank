// src/app/demo/layout.tsx
import { ReactNode } from "react";
import Link from 'next/link';
import { DemoProvider } from "@/contexts/demo-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
        <div className="bg-muted min-h-screen">
          <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="inline-block h-8 w-8 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">ƒ</span>
                    <span className="text-lg">FlowBank</span>
                </Link>
                <nav className="text-sm font-medium">
                    You are in an Interactive Demo
                </nav>
            </div>
          </header>
          
          <Alert className="rounded-none border-x-0 border-t-0 bg-blue-50 border-blue-200 text-blue-800">
            <Sparkles className="h-4 w-4 !text-blue-600" />
            <AlertTitle>This is an Interactive Demo of FlowBank Pro!</AlertTitle>
            <AlertDescription>
            Explore the features below using sample data. Click the play button on a transaction to see automatic allocations in action.
            <Button asChild size="sm" className="ml-4 bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/signup">Create a Free Account</Link>
            </Button>
            </AlertDescription>
        </Alert>

          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="border-t bg-card">
                <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground text-center">
                  © {new Date().getFullYear()} FlowBank Demo
                </div>
              </footer>
        </div>
    </DemoProvider>
  );
}
