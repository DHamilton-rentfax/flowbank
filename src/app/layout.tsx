import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import React from "react";
import { ClientLayout } from "@/components/layout/client-layout";

export const metadata: Metadata = {
  title: "FlowBank | Split. Stash. Scale your profits.",
  description: "FlowBank is a financial automation app that allows entrepreneurs and individuals to automatically split their income into custom categories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-body antialiased">
        <AuthProvider>
            <ClientLayout>
                {children}
            </ClientLayout>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
