
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { AppProvider } from "@/contexts/app-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowBank | Your Automated Finances",
  description: "FlowBank automatically allocates your income to different pots for tax, savings, and more.",
  other: {
    "facebook-domain-verification": "t26ejs4sm8w5jftvwae1lmrn3y65u2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
