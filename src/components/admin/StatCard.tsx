"use client";
import React from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function StatCard({ title, value, subtitle, right }: StatCardProps) {
  return (
    <div className="rounded-2xl border p-4 md:p-5 shadow-sm bg-white">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        {right ? <div className="ml-4">{right}</div> : null}
      </div>
    </div>
  );
}