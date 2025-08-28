// src/app/splits/page.tsx (SERVER COMPONENT)
import {
  getExternalAccounts,
  canAddExternalAccount,
  createExternalAccount,
  removeExternalAccount,
  splitLimitForPlan,
  getUserPlan,
} from "../actions";

// server action for deleting an external account (no closure over acc.id)
async function removeAccountAction(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Missing account id");
  }
  await removeExternalAccount(id);
}

export default async function SplitsPage() {
  const [accounts, addPerm, plan] = await Promise.all([
    getExternalAccounts().catch(() => [] as any[]),
    canAddExternalAccount(),
    getUserPlan(),
  ]);

  const limit = splitLimitForPlan(plan); // number | "unlimited"
  const limitLabel = limit === "unlimited" ? "∞" : String(limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Income Splits</h1>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Plan</div>
            <div className="font-medium capitalize">{plan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">External accounts</div>
            <div className="font-medium">
              {accounts.length} / {limitLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">Linked External Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-600">No external accounts yet.</p>
        ) : (
          <ul className="divide-y">
            {accounts.map((acc: any) => (
              <li key={acc.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{acc.nickname}</div>
                  <div className="text-xs text-gray-600">
                    Routing {acc.routingMasked} · Account {acc.accountMasked}
                  </div>
                </div>

                {/* Use a server action that reads the id from the form */}
                <form action={removeAccountAction}>
                  <input type="hidden" name="id" value={acc.id} />
                  <button className="rounded-md border px-3 py-1.5" type="submit">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">Add External Account</h2>
        {!addPerm.allowed ? (
          <div className="text-sm">
            You’ve reached your plan’s limit.&nbsp;
            <a href="/pricing" className="underline text-blue-600">
              Upgrade
            </a>{" "}
            to add more.
          </div>
        ) : (
          // createExternalAccount should be a server action that accepts FormData
          <form action={createExternalAccount} className="grid gap-3 md:grid-cols-4">
            <input
              name="nickname"
              placeholder="Nickname"
              className="rounded-md border px-3 py-2"
              required
            />
            <input
              name="routing"
              placeholder="Routing number"
              className="rounded-md border px-3 py-2"
              required
            />
            <input
              name="account"
              placeholder="Account number"
              className="rounded-md border px-3 py-2"
              required
            />
            <button type="submit" className="rounded-md border px-3 py-2">
              Add
            </button>
          </form>
        )}
        <p className="mt-2 text-xs text-gray-500">
          For demo purposes this stores masked numbers only. Replace with your Plaid/ACH flow when ready.
        </p>
      </div>
    </div>
  );
}
