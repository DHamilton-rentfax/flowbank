"use server";

/**
 * Exchanges Plaid public_token for access_token,
 * stores into Firestore under plaid_items, and snapshots accounts.
 * Env required:
 *  - PLAID_CLIENT_ID
 *  - PLAID_SECRET
 *  - PLAID_ENV
 *  - FIREBASE_ADMIN_CERT_B64
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// -------- Minimal Firebase Admin helper (inline) ----------
function adminApp() {
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";
    const credentials = JSON.parse(json);
    initializeApp({ credential: cert(credentials) });
  }
  return getApps()[0];
}
function serverAuth() {
  return getAuth(adminApp());
}
function db() {
  return getFirestore(adminApp());
}

type PlaidEnv = "development" | "sandbox" | "production";
function basePath(env: PlaidEnv) {
  return env === "production"
    ? "https://production.plaid.com"
    : env === "development"
    ? "https://development.plaid.com"
    : "https://sandbox.plaid.com";
}

type ExchangeInput = {
  uid: string;
  publicToken: string;
};

async function getPlaid() {
  const plaid = await import("plaid");
  const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
  const PLAID_SECRET = process.env.PLAID_SECRET;
  const PLAID_ENV = (process.env.PLAID_ENV as PlaidEnv) || "sandbox";
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error("PLAID_CLIENT_ID or PLAID_SECRET is missing");
  }
  const configuration = new plaid.Configuration({
    basePath: basePath(PLAID_ENV),
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
        "PLAID-SECRET": PLAID_SECRET,
      },
    },
  });
  return new plaid.PlaidApi(configuration);
}

export async function exchangePublicToken(input: ExchangeInput) {
  if (!input?.uid) throw new Error("uid is required");
  if (!input?.publicToken) throw new Error("publicToken is required");

  const user = await serverAuth().getUser(input.uid).catch(() => null);
  if (!user) throw new Error("Invalid user");

  const plaidClient = await getPlaid();

  // 1) Exchange for access token
  const exchange = await plaidClient.itemPublicTokenExchange({
    public_token: input.publicToken,
  });

  const accessToken = exchange.data.access_token as string;
  const itemId = exchange.data.item_id as string;

  // 2) Fetch accounts to snapshot metadata
  const accountsResp = await plaidClient.accountsGet({ access_token: accessToken });
  const accounts = accountsResp.data.accounts || [];

  // 3) Write to Firestore
  const docRef = db().collection("plaid_items").doc(itemId);
  await docRef.set(
    {
      userId: input.uid,
      accessToken,
      institution: accountsResp.data.item?.institution_id
        ? { id: accountsResp.data.item?.institution_id }
        : null,
      accounts,
      transactionsCursor: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db().collection("audit_logs").add({
    type: "PLAID_ITEM_LINKED",
    uid: input.uid,
    itemId,
    accountsCount: accounts.length,
    createdAt: new Date(),
  });

  return { itemId, accountsCount: accounts.length };
}