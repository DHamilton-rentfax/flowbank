
"use client";

export default function DemoHero({ onReset }: { onReset: () => void }) {
  return (
    <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold">FlowBank Pro — Live Demo</h1>
      <p className="mt-1 text-gray-600">
        Explore a fully-populated workspace with sample data. Run allocations, view insights, and see
        how FlowBank helps you automate profit splits and decisions.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href="/pricing" className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90">Get Started Free</a>
        <a href="/login" className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50">Sign In</a>
        <button onClick={onReset} className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50">Reset Demo</button>
      </div>
    </section>
  );
}
