
"use client";

// Lightweight inline SVG chart (no extra libs)
export default function DemoCharts({ series }: { series: number[] }) {
  const w = 600, h = 160, pad = 16;
  const max = Math.max(...series, 1);
  const pts = series.map((v, i) => {
    const x = pad + (i * (w - 2*pad)) / (series.length - 1);
    const y = h - pad - (v / max) * (h - 2*pad);
    return `${x},${y}`;
  }).join(" ");

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-semibold">Cash Flow (30 days)</div>
      <div className="overflow-x-auto">
        <svg width={w} height={h} className="rounded-xl border bg-gray-50">
          <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <p className="mt-2 text-xs text-gray-500">Sample data for demo purposes.</p>
    </section>
  );
}
