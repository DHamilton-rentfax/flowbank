// Server Component
import { listAuditLogs, listDLQ } from '@/app/actions/webhook-admin';
import WebhooksDashboard from '@/components/admin/webhooks-dashboard';

export const dynamic = 'force-dynamic'; // always fresh

export default async function Page() {
  // TODO: protect this route with your existing admin/superadmin guard
  const [audit, dlq] = await Promise.all([
    listAuditLogs({ limit: 50 }),
    listDLQ({ limit: 50 })
  ]);
  return <WebhooksDashboard initialAudit={audit} initialDLQ={dlq} />;
}