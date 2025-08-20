// Server Component
import { db } from '@/firebase/server';

export const dynamic = 'force-dynamic';

function isSet(v?: string) {
  return v ? '✅ set' : '❌ missing';
}

export default async function Page() {
  // Light Firestore check
  let firestoreOk = false;
  try {
    await db.collection('_health').doc('ping').set({ ts: Date.now() }, { merge: true });
    firestoreOk = true;
  } catch {
    firestoreOk = false;
  }

  const checks = [
    { key: 'STRIPE_SECRET_KEY', status: isSet(process.env.STRIPE_SECRET_KEY) },
    { key: 'STRIPE_WEBHOOK_SECRET', status: isSet(process.env.STRIPE_WEBHOOK_SECRET) },
    { key: 'SENDGRID_API_KEY', status: isSet(process.env.SENDGRID_API_KEY) },
    { key: 'FIREBASE_ADMIN_CERT_B64', status: isSet(process.env.FIREBASE_ADMIN_CERT_B64) },
    { key: 'APP_URL', status: isSet(process.env.APP_URL) },

    { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', status: isSet(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) },
    { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', status: isSet(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) },
    { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', status: isSet(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) },
    { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', status: isSet(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) },
    { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', status: isSet(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) },
    { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', status: isSet(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Environment Diagnostics</h1>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Variable</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {checks.map(row => (
              <tr key={row.key} className="border-t">
                <td className="p-2 font-mono">{row.key}</td>
                <td className="p-2">{row.status}</td>
              </tr>
            ))}
            <tr className="border-t">
              <td className="p-2 font-mono">FIRESTORE_WRITE</td>
              <td className="p-2">{firestoreOk ? '✅ ok' : '❌ failed'}</td>
            </tr>
            <tr className="border-t">
              <td className="p-2 font-mono">NODE_VERSION</td>
              <td className="p-2">{process.version}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        This page never shows secret values—only whether they are set.
      </p>
    </div>
  );
}