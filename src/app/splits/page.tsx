import { getExternalAccounts, canAddExternalAccount, createExternalAccount, removeExternalAccount, splitLimitForPlan, getUserPlan } from "../actions";

export default async function SplitsPage() {
  const [accounts, addPerm, plan] = await Promise.all([
    getExternalAccounts().catch(() => [] as any[]),
    canAddExternalAccount(),
    getUserPlan(),
  ]);

  const limit = splitLimitForPlan(plan);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Income Splits</h1>

      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Plan</div>
            <div className="font-medium capitalize">{plan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">External accounts</div>
            <div className="font-medium">
              {accounts.length} / {limit === "unlimited" ? "∞" : limit}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">Linked External Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-600">No external accounts yet.</p>
        ) : (
          <ul className="divide-y">
            {accounts.map((acc) => (
              <li key={acc.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{acc.nickname}</div>
                  <div className="text-xs text-gray-600">
                    Routing {acc.routingMasked} · Account {acc.accountMasked}
                  </div>
                </div>
                <form action={async () => { "use server"; await removeExternalAccount(acc.id); }} >
                  <button className="px-3 py-1.5 border rounded-md" type="submit">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">Add External Account</h2>
        {!addPerm.allowed ? (
          <div className="text-sm">
            You’ve reached your plan’s limit.&nbsp;
            <a href="/pricing" className="text-blue-600 underline">Upgrade</a> to add more.
          </div>
        ) : (
          <form action={createExternalAccount} className="grid md:grid-cols-4 gap-3">
            <input name="nickname" placeholder="Nickname" className="border rounded-md px-3 py-2" required />
            <input name="routing" placeholder="Routing number" className="border rounded-md px-3 py-2" required />
            <input name="account" placeholder="Account number" className="border rounded-md px-3 py-2" required />
            <button type="submit" className="border rounded-md px-3 py-2">Add</button>
          </form>
        )}
        <p className="text-xs text-gray-500 mt-2">
          For demo purposes this stores masked numbers only. Replace with your Plaid/ACH flow when ready.
        </p>
      </div>
    </div>
  );
}
import { getExternalAccounts, canAddExternalAccount, createExternalAccount, removeExternalAccount, splitLimitForPlan, getUserPlan } from "../actions";

export default async function SplitsPage() {
  const [accounts, addPerm, plan] = await Promise.all([
    getExternalAccounts().catch(() => [] as any[]),
    canAddExternalAccount(),
    getUserPlan(),
  ]);

  const limit = splitLimitForPlan(plan);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Income Splits</h1>

      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Plan</div>
            <div className="font-medium capitalize">{plan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">External accounts</div>
            <div className="font-medium">
              {accounts.length} / {limit === "unlimited" ? "∞" : limit}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">Linked External Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-600">No external accounts yet.</p>
        ) : (
          <ul className="divide-y">
            {accounts.map((acc) => (
              <li key={acc.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{acc.nickname}</div>
                  <div className="text-xs text-gray-600">
                    Routing {acc.routingMasked} · Account {acc.accountMasked}
                  </div>
                </div>
                <form action={async () => { "use server"; await removeExternalAccount(acc.id); }} >
                  <button className="px-3 py-1.5 border rounded-md" type="submit">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">Add External Account</h2>
        {!addPerm.allowed ? (
          <div className="text-sm">
            You’ve reached your plan’s limit.&nbsp;
            <a href="/pricing" className="text-blue-600 underline">Upgrade</a> to add more.
          </div>
        ) : (
          <form action={createExternalAccount} className="grid md:grid-cols-4 gap-3">
            <input name="nickname" placeholder="Nickname" className="border rounded-md px-3 py-2" required />
            <input name="routing" placeholder="Routing number" className="border rounded-md px-3 py-2" required />
            <input name="account" placeholder="Account number" className="border rounded-md px-3 py-2" required />
            <button type="submit" className="border rounded-md px-3 py-2">Add</button>
          </form>
        )}
        <p className="text-xs text-gray-500 mt-2">
          For demo purposes this stores masked numbers only. Replace with your Plaid/ACH flow when ready.
        </p>
      </div>
    </div>
  );
}