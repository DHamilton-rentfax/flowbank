
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import React from "react";
import { ClientLayout } from "@/components/layout/client-layout";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "FlowBank | Split. Stash. Scale your profits.",
  description: "FlowBank is a financial automation app that allows entrepreneurs and individuals to automatically split their income into custom categories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const firebaseConfig = {
    apiKey: "AIzaSyDzJuxDWtnLYrBVz6VwN_VcIdRyBhHz8uY",
    authDomain: "flow-bank-app.firebaseapp.com",
    projectId: "flow-bank-app",
    storageBucket: "flow-bank-app.appspot.com",
    messagingSenderId: "192553978727",
    appId: "1:192553978727:web:8a97d6b6c01d5d919a3dc2"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AuthProvider firebaseConfig={firebaseConfig}>
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
