// src/app/demo/layout.tsx
import { ReactNode } from "react";
import Link from 'next/link';

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-muted min-h-screen">
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="inline-block h-8 w-8 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">ƒ</span>
                <span className="text-lg">FlowBank</span>
            </Link>
            <nav className="text-sm font-medium">
                You are in Demo Mode
            </nav>
        </div>
      </header>
      <main>{children}</main>
       <footer className="border-t bg-card">
            <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} FlowBank Demo
            </div>
          </footer>
    </div>
  );
}
