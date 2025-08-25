import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import HeaderPublic from "./components/HeaderPublic";

export const metadata: Metadata = {
  title: "FlowBank",
  description: "Automated income splits and AI financial insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <HeaderPublic />
          <main className="min-h-screen bg-gray-50 text-gray-900">{children}</main>
          <footer className="border-t bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600">
              © {new Date().getFullYear()} FlowBank — <a href="/privacy" className="hover:underline">Privacy</a> ·{" "}
              <a href="/terms" className="hover:underline">Terms</a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}