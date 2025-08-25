import { acceptInvite } from "../../actions";

export default async function AcceptInvitePage({ params }: { params: { inviteId: string } }) {
  let msg = "Joining...";
  try {
    const res = await acceptInvite(params.inviteId);
    msg = res.ok ? "You have joined the organization. Redirecting..." : "Unable to join.";
  } catch (e: any) {
    msg = e.message || "Unable to join.";
  }
  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold mb-2">Accept Invite</h1>
      <p>{msg}</p>
      <meta httpEquiv="refresh" content="2;url=/dashboard" />
    </div>
  );
}