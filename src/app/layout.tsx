import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/providers/AuthProvider";        // wraps Firebase auth context
import { AppProvider } from "@/contexts/app-provider";      // <-- real app context

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowBank",
  description: "Automate cash flow & insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}