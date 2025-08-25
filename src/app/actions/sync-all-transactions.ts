"use server";

/**
 * /home/runner/work/fire-cms/fire-cms/src/app/actions/sync-all-transactions.ts
 *
 * Syncs transactions for all connected Plaid items and upserts them into Firestore.
 * Expects the following environment variables:
 * - FIREBASE_ADMIN_CERT_B64 (Base64 JSON for Firebase Admin credentials)
 * - PLAID_CLIENT_ID
 * - PLAID_SECRET
 * - PLAID_ENV (development | sandbox | production) - defaults to 'sandbox'
 */

// --- Minimal Firebase Admin helpers (INLINE, no src/lib imports) ---
import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Firestore, WriteBatch } from "firebase-admin/firestore";

// ---------------- minimal Firebase Admin helper ----------------
function adminApp() {
  if (getApps().length === 0) {
    const credentialsJson = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";

    const credentials = JSON.parse(credentialsJson);
    initializeApp({ credential: cert(credentials) });
  }
  return getApps()[0];
}

function serverAuth() {
  return getAuth(adminApp());
}

function db(): Firestore {
  return getFirestore(adminApp());
}

async function getUserById(uid: string) {
  return serverAuth().getUser(uid);
}
// ---------------- end minimal helper ---------------------------

// ---------- Types local to this file ----------
type PlaidEnv = "development" | "sandbox" | "production";

type PlaidItemDoc = {
  id?: string; // doc id (injected at runtime)
  userId: string;
  accessToken: string; // securely stored token
  institution?: { name?: string; id?: string };
  transactionsCursor?: string | null;
  lastSyncedAt?: FirebaseFirestore.Timestamp;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
};

type SyncResult = {
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  transactions: {
    added: number;
    modified: number;
    removed: number;
  };
  itemErrors: Array<{ itemId: string; error: string }>;
};

// ---------- Small utilities ----------
function getPlaidBasePath(env: PlaidEnv) {
  // Importing enum here would require Plaid types; keep a simple map instead.
  const basePaths = {
    development: "https://development.plaid.com",
    sandbox: "https://sandbox.plaid.com",
    production: "https://production.plaid.com",
  } as const;
  return basePaths[env] ?? basePaths.sandbox;
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`${name} is missing. Set it in your environment.`);
  }
  return v;
}

async function withBatches(
  firestore: Firestore,
  writes: (batch: WriteBatch) => Promise<void>,
  maxOps = 400
) {
  // Simple helper to ensure we never exceed Firestore 500 writes/commit.
  // We allow a margin (400) for safety w/ possible additional metadata writes.
  let currentBatch = firestore.batch();
  let ops = 0;

  const commit = async () => {
    if (ops > 0) {
      await currentBatch.commit();
      currentBatch = firestore.batch();
      ops = 0;
    }
  };

  // Proxy writes so caller doesn't need to manage commit boundaries.
  const proxy = new Proxy(
    {},
    {
      get: (_, prop: keyof WriteBatch) =>
        (...args: any[]) => {
          // Map batch methods and bump op count only for set/update/delete
          const fn = (currentBatch as any)[prop].bind(currentBatch);
          if (prop === "set" || prop === "update" || prop === "delete") {
            ops += 1;
            if (ops >= maxOps) {
              // force commit before running next op
              // Note: we can't await inside getter; so we return a wrapper
              return (async () => {
                await commit();
                // after commit, start fresh batch and do the op
                return (currentBatch as any)[prop](...args);
              })();
            }
          }
          return fn(...args);
        },
    }
  ) as unknown as WriteBatch;

  await writes(proxy);
  await commit();
}

// ---------- Core sync function ----------
export async function syncAllTransactions(): Promise<SyncResult> {
  // Validate critical env at runtime
  requiredEnv("FIREBASE_ADMIN_CERT_B64");
  const PLAID_CLIENT_ID = requiredEnv("PLAID_CLIENT_ID");
  const PLAID_SECRET = requiredEnv("PLAID_SECRET");
  const PLAID_ENV = (process.env.PLAID_ENV as PlaidEnv) || "sandbox";

  const firestore = db();

  // Dynamically import Plaid SDK to avoid bundling in client
  const plaid = await import("plaid");
  const { Configuration, PlaidApi } = plaid;

  const configuration = new Configuration({
    basePath: getPlaidBasePath(PLAID_ENV),
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
        "PLAID-SECRET": PLAID_SECRET,
      },
    },
  });

  const plaidClient = new PlaidApi(configuration);

  // 1) Load all Plaid items
  const itemsSnap = await firestore.collection("plaid_items").get();
  const items: PlaidItemDoc[] = itemsSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as PlaidItemDoc),
  }));

  const result: SyncResult = {
    itemsProcessed: items.length,
    itemsSucceeded: 0,
    itemsFailed: 0,
    transactions: { added: 0, modified: 0, removed: 0 },
    itemErrors: [],
  };

  // 2) Iterate items and sync
  for (const item of items) {
    if (!item.accessToken) {
      result.itemsFailed += 1;
      result.itemErrors.push({ itemId: item.id || "unknown", error: "Missing accessToken" });
      continue;
    }

    const itemId = item.id || "unknown";
    let cursor = item.transactionsCursor || null;

    try {
      let hasMore = true;
      let totalAdded = 0;
      let totalModified = 0;
      let totalRemoved = 0;

      while (hasMore) {
        const resp = await plaidClient.transactionsSync({
          access_token: item.accessToken,
          cursor: cursor ?? undefined,
          count: 500, // adjust as needed
          options: {
            include_personal_finance_category: true,
          },
        });

        const {
          added = [],
          modified = [],
          removed = [],
          next_cursor,
          has_more,
        } = resp.data as any;

        // 3) Upsert to Firestore in safe batches
        await withBatches(firestore, async (batch) => {
          // added/modified -> set/merge
          for (const tx of [...added, ...modified]) {
            const txId = tx.transaction_id || tx.transactionId;
            if (!txId) continue;

            const ref = firestore.collection("transactions").doc(txId);
            batch.set(ref, {
              ...tx,
              itemId,
              userId: item.userId,
              updatedAt: FieldValue.serverTimestamp(),
              createdAt: FieldValue.serverTimestamp(), // first time wins
            }, { merge: true });
          }

          // removed -> mark as removed (soft delete) to keep history
          for (const r of removed) {
            const txId = r.transaction_id || r.transactionId;
            if (!txId) continue;

            const ref = firestore.collection("transactions").doc(txId);
            batch.set(ref, {
              itemId,
              userId: item.userId,
              removed: true,
              removedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
          }

          // Also update the item’s next cursor and timestamps
          if (next_cursor) {
            const itemRef = firestore.collection("plaid_items").doc(itemId);
            batch.update(itemRef, {
              transactionsCursor: next_cursor,
              lastSyncedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        });

        // 4) Aggregate counts and advance loop state
        totalAdded += added.length;
        totalModified += modified.length;
        totalRemoved += removed.length;

        cursor = next_cursor || cursor;
        hasMore = Boolean(has_more);
      }

      // item success
      result.itemsSucceeded += 1;
      result.transactions.added += totalAdded;
      result.transactions.modified += totalModified;
      result.transactions.removed += totalRemoved;
    } catch (err: any) {
      result.itemsFailed += 1;
      result.itemErrors.push({
        itemId,
        error: err?.message || String(err),
      });

      // Mark item’s last failure timestamp (optional)
      await firestore.collection("plaid_items").doc(itemId).set(
        {
          lastSyncErrorAt: FieldValue.serverTimestamp(),
          lastSyncError: err?.message || String(err),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  return result;
}

// Optional: a convenience admin-only action that can be called from a button in your UI
export async function syncAllTransactionsAsAdmin(currentUserId: string) {
  // Basic check — adjust to your roles system as needed
  try {
    const user = await getUserById(currentUserId);
    const isSuperAdmin =
      (user.customClaims && user.customClaims.role === "super_admin") ||
      (user.customClaims && user.customClaims.admin === true);

    if (!isSuperAdmin) {
      throw new Error("Permission denied: admin only.");
    }
  } catch {
    throw new Error("Unable to verify current user or permissions.");
  }

  return syncAllTransactions();
}