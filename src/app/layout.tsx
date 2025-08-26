import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import HeaderPublic from "./components/HeaderPublic";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowBank",
  description: "Automated income splits and AI financial insights for modern businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <HeaderPublic />
          <main className="min-h-screen bg-background text-foreground">{children}</main>
          <footer className="border-t bg-card">
            <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground">
              © {new Date().getFullYear()} FlowBank — <a href="/privacy" className="hover:underline">Privacy</a> ·{" "}
              <a href="/terms" className="hover:underline">Terms</a>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
