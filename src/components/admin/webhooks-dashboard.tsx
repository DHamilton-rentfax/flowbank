'use client';

import React from 'react';

type AuditLog = {
  id: string;
  type: string;               // e.g., 'INVOICE:invoice.payment_succeeded'
  source?: string;            // optional: 'stripe' | 'plaid' | ...
  stripeCustomerId?: string | null;
  payload?: any;
  ts: number;
  userId?: string | null;
};

type DLQItem = {
  id: string;
  source: string;
  type: string;
  payload: any;
  error?: string;
  ts: number;
};

export default function WebhooksDashboard(props: {
  initialAudit: { items: AuditLog[]; nextCursor: number | null };
  initialDLQ: { items: DLQItem[]; nextCursor: number | null };
}) {
  const [audit, setAudit] = React.useState(props.initialAudit.items);
  const [auditCursor, setAuditCursor] = React.useState<number | null>(props.initialAudit.nextCursor);
  const [dlq, setDlq] = React.useState(props.initialDLQ.items);
  const [dlqCursor, setDlqCursor] = React.useState<number | null>(props.initialDLQ.nextCursor);
  const [loading, setLoading] = React.useState(false);
  const [sourceFilter, setSourceFilter] = React.useState<'all'|'stripe'|'plaid'>('all');
  const [tab, setTab] = React.useState<'audit'|'dlq'>('audit');

  async function loadMoreAudit() {
    setLoading(true);
    try {
      const { listAuditLogs } = await import('@/app/actions/webhook-admin');
      const res = await listAuditLogs({
        beforeTs: auditCursor || undefined,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
        limit: 50
      });
      setAudit(a => [...a, ...res.items]);
      setAuditCursor(res.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreDLQ() {
    setLoading(true);
    try {
      const { listDLQ } = await import('@/app/actions/webhook-admin');
      const res = await listDLQ({
        beforeTs: dlqCursor || undefined,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
        limit: 50
      });
      setDlq(d => [...d, ...res.items]);
      setDlqCursor(res.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  async function replay(id: string) {
    setLoading(true);
    try {
      const { replayDLQEntry } = await import('@/app/actions/webhook-admin');
      const res = await replayDLQEntry(id);
      if (!res?.ok) alert(`Replay failed: ${res?.error || 'Unknown error'}`);
      else alert('Replayed successfully');
    } finally {
      setLoading(false);
    }
  }

  async function removeDLQ(id: string) {
    setLoading(true);
    try {
      const { deleteDLQEntry } = await import('@/app/actions/webhook-admin');
      await deleteDLQEntry(id);
      setDlq(items => items.filter(i => i.id !== id));
    } finally {
      setLoading(false);
    }
  }

  async function applyFilter(next: 'all'|'stripe'|'plaid') {
    setSourceFilter(next);
    // Reload both lists fresh
    const [{ listAuditLogs }, { listDLQ }] = await Promise.all([
      import('@/app/actions/webhook-admin'),
      import('@/app/actions/webhook-admin')
    ]);
    const [a, d] = await Promise.all([
      listAuditLogs({ limit: 50, source: next === 'all' ? undefined : next }),
      listDLQ({ limit: 50, source: next === 'all' ? undefined : next })
    ]);
    setAudit(a.items); setAuditCursor(a.nextCursor);
    setDlq(d.items); setDlqCursor(d.nextCursor);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Webhooks</h1>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1"
            value={sourceFilter}
            onChange={e => applyFilter(e.target.value as any)}
          >
            <option value="all">All sources</option>
            <option value="stripe">Stripe</option>
            <option value="plaid">Plaid</option>
          </select>
          <div className="flex rounded border overflow-hidden">
            <button
              className={`px-3 py-1 ${tab==='audit' ? 'bg-gray-900 text-white' : ''}`}
              onClick={() => setTab('audit')}
            >Audit Logs</button>
            <button
              className={`px-3 py-1 ${tab==='dlq' ? 'bg-gray-900 text-white' : ''}`}
              onClick={() => setTab('dlq')}
            >Dead Letter Queue</button>
          </div>
        </div>
      </div>

      {tab === 'audit' && (
        <>
          <div className="border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Customer/User</th>
                </tr>
              </thead>
              <tbody>
                {audit.map(row => (
                  <tr key={row.id} className="border-t">
                    <td className="p-2">{new Date(row.ts).toLocaleString()}</td>
                    <td className="p-2">{row.source || '-'}</td>
                    <td className="p-2">{row.type}</td>
                    <td className="p-2">
                      {row.stripeCustomerId || row.userId || '-'}
                    </td>
                  </tr>
                ))}
                {!audit.length && (
                  <tr><td className="p-3 text-gray-500" colSpan={4}>No audit logs.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <button
              disabled={!auditCursor || loading}
              onClick={loadMoreAudit}
              className="px-3 py-1 rounded border"
            >
              {loading ? 'Loading...' : auditCursor ? 'Load more' : 'All caught up'}
            </button>
          </div>
        </>
      )}

      {tab === 'dlq' && (
        <>
          <div className="border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Error</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dlq.map(row => (
                  <tr key={row.id} className="border-t">
                    <td className="p-2">{new Date(row.ts).toLocaleString()}</td>
                    <td className="p-2">{row.source}</td>
                    <td className="p-2">{row.type}</td>
                    <td className="p-2">{row.error || '-'}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button onClick={() => replay(row.id)} className="px-2 py-1 border rounded">Replay</button>
                        <button onClick={() => removeDLQ(row.id)} className="px-2 py-1 border rounded">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!dlq.length && (
                  <tr><td className="p-3 text-gray-500" colSpan={5}>DLQ is empty.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <button
              disabled={!dlqCursor || loading}
              onClick={loadMoreDLQ}
              className="px-3 py-1 rounded border"
            >
              {loading ? 'Loading...' : dlqCursor ? 'Load more' : 'All caught up'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}