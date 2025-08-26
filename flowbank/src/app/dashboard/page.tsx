import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  // TODO: replace with your real content / data queries
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Welcome{user.name ? `, ${user.name}` : ""}!</h1>
      <p className="text-sm text-gray-600">Signed in as {user.email ?? user.uid}</p>

      <div className="mt-6 rounded-lg border p-4">
        <p>No dashboard data yet. Wire your queries here.</p>
      </div>
    </main>
  );
}
