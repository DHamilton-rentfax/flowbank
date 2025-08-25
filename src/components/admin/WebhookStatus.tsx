"use client";
import React from "react";

type Props = {
  status: "ok" | "degraded" | "down";
  lastEventAt?: string; // ISO string
};

const color: Record<Props["status"], string> = {
  ok: "bg-green-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
};

export default function WebhookStatus({ status, lastEventAt }: Props) {
  return (
    <div className="rounded-2xl border p-4 md:p-5 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${color[status]}`} />
        <span className="font-medium capitalize">Webhook: {status}</span>
      </div>
      {lastEventAt && (
        <p className="mt-2 text-xs text-gray-500">
          Last event: {new Date(lastEventAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}