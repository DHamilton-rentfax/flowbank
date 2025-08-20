import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/app-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthContextProvider } from "@/hooks/use-auth";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowBank",
  description: "Automate cash flow & insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthContextProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
