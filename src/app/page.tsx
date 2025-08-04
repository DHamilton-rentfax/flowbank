import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="size-7 text-primary" />
          <h1 className="text-xl font-semibold">Flow Bank</h1>
        </div>
        <nav>
          <Button variant="ghost" asChild>
            <Link href="/blog">Blog</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Automate Your Finances.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Flow Bank helps you automatically split your income into different accounts based on rules you set. Take control of your money effortlessly.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="p-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Flow Bank. All rights reserved.
      </footer>
    </div>
  );
}
