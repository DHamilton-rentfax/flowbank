
"use client";

type Props = {
  balances: { label: string; value: number }[];
};

export default function DemoKpis({ balances }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {balances.map((k) => (
        <div key={k.label} className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">{k.label}</div>
          <div className="mt-1 text-2xl font-semibold">${k.value.toLocaleString()}</div>
        </div>
      ))}
    </section>
  );
}
