export async function GET() {
  const ok = !!process.env.FIREBASE_ADMIN_CERT_JSON;
  let project = "unknown";
  try { project = JSON.parse(process.env.FIREBASE_ADMIN_CERT_JSON || "{}").project_id || "missing"; } catch {}
  return new Response(JSON.stringify({ ok, project }), { status: ok ? 200 : 500 });
}