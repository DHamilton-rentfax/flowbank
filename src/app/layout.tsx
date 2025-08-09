
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import React from "react";
import { ClientLayout } from "@/components/layout/client-layout";
import { Header } from "@/components/layout/header";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head />
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
            <ClientLayout>
                <Header />
                <main className="pt-16">
                  {children}
                </main>
            </ClientLayout>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
