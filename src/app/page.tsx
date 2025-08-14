"use client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 flex items-center justify-center text-center bg-secondary">
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-foreground">
              Automate Your Business Finances
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              FlowBank intelligently splits your income into accounts for
              taxes, savings, and expenses, so you don&apos;t have to.
            </p>
            <Button asChild size="lg">
              <Link href="/onboarding">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary text-primary-foreground p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M12 22v-5"/><path d="M9 17H7A5 5 0 0 1 7 7h1a3 3 0 0 0 3-3V2"/><path d="M15 17h2a5 5 0 0 0 0-10h-1a3 3 0 0 1-3-3V2"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Connect Your Bank</h3>
                <p className="text-muted-foreground">
                  Securely link your bank account using Plaid. We detect incoming
                  revenue automatically.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary text-primary-foreground p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M12 14h0"/><path d="M12 18h0"/><path d="M12 10h0"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Set Your Rules</h3>
                <p className="text-muted-foreground">
                  Define percentages for categories like Taxes (25%),
                  Profit (10%), and Operating Costs (65%).
                </p>
              </div>
              <div className="flex flex-col items-center">
                 <div className="rounded-full bg-primary text-primary-foreground p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="m12 15 4 4"/><path d="M15.5 8.5c.3-1.8.8-3.4 1.5-4.8"/><path d="M5.1 6.3C4.1 7.6 3.4 9.2 3.1 11c-.1.6-.1 1.2-.1 1.8 0 1.6.4 3.2 1.2 4.5"/><path d="M13 20c.5-.2 1-.4 1.5-.7.9-.5 1.7-1.1 2.4-1.8.4-.4.7-.8.9-1.2"/><path d="m18 10-4-4"/><path d="M12.2 4.2c.4-.2.9-.4 1.3-.6 2.3-1.1 4.9-1.2 7.2-.3"/><path d="M5.5 19.5c-1.8-.3-3.4-.8-4.8-1.5-1.3-.7-2.4-1.6-3.1-2.7"/><path d="M3.1 3.1c1.1-1.1 2.5-1.9 4-2.4C8.7 0 10.3 0 12 0c.6 0 1.2.1 1.8.1"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Relax</h3>
                <p className="text-muted-foreground">
                  As funds arrive, they are automatically allocated to virtual
                  accounts based on your rules.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
