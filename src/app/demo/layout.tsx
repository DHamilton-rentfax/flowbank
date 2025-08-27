
// "use client" NOT needed here - layout is server by default
import type { ReactNode } from "react";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Minimal header just for demo */}
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-black" />
              <span className="text-lg font-semibold">FlowBank Demo</span>
            </div>
            <nav className="flex items-center gap-3">
              <a href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</a>
              <a href="/pricing" className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
                Get Started Free
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
