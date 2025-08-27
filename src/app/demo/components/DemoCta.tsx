
"use client";

export default function DemoCta() {
  return (
    <section className="rounded-2xl bg-black p-6 text-white">
      <h3 className="text-xl font-semibold">See this working with your real accounts</h3>
      <p className="mt-1 text-sm text-gray-300">Connect a bank, create your first split, and get AI insights in minutes.</p>
      <div className="mt-4 flex gap-3">
        <a href="/pricing" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90">Get Started Free</a>
        <a href="/login" className="rounded-xl border border-white px-4 py-2 text-sm font-medium hover:bg-white/10">Sign In</a>
      </div>
    </section>
  );
}
