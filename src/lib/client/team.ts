
export async function getTeamAuditLogs() {
  const res = await fetch('/api/team/audit-logs', { cache: 'no-store' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorData.error || 'Failed to fetch logs');
  }
  const data = await res.json();
  return data;
}
