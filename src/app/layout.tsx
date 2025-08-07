
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

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AuthProvider firebaseConfig={firebaseConfig}>
            <ClientLayout>
                {children}
            </ClientLayout>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
