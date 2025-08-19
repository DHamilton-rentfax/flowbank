// src/lib/client/team.ts
export async function getTeamAuditLogs() {
  const res = await fetch('/api/team/audit-logs', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorData.error || `Failed to fetch audit logs: ${res.statusText}`);
  }

  return await res.json();
}
