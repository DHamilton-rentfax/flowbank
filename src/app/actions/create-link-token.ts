"use server";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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
// ---------------------------------------------------------

type PlaidEnv = "development" | "sandbox" | "production";
function basePath(env: PlaidEnv) {
  return env === "production"
    ? "https://production.plaid.com"
    : env === "development"
    ? "https://development.plaid.com"
    : "https://sandbox.plaid.com";
}

type CreateLinkTokenInput = {
  uid: string;
  accessToken?: string;
  products?: string[];
  countryCodes?: string[];
  language?: string;
  redirectUri?: string;
  clientName?: string;
};

async function getPlaid() {
  const plaid = await import("plaid");
  const { Configuration, PlaidApi } = plaid;
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

export async function createLinkToken(input: CreateLinkTokenInput) {
  if (!input?.uid) throw new Error("uid is required");
  const user = await serverAuth().getUser(input.uid);
  const email = user.email || undefined;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const plaidClient = await getPlaid();

  const products = input.products?.length ? input.products : ["transactions"];
  const countryCodes = input.countryCodes?.length ? input.countryCodes : ["US"];
  const language = input.language || "en";
  const clientName = input.clientName || "FlowBank";
  const redirectUri = input.redirectUri || `${siteUrl}/plaid/callback`;

  const isUpdateMode = Boolean(input.accessToken);

  const request: any = {
    user: { client_user_id: input.uid },
    client_name: clientName,
    products: isUpdateMode ? [] : products,
    country_codes: countryCodes,
    language,
    redirect_uri: redirectUri,
  };

  if (email) {
    request.user_email_address = email;
  }
  if (isUpdateMode) {
    request.access_token = input.accessToken!;
  }

  const resp = await plaidClient.linkTokenCreate(request);
  const linkToken = resp.data.link_token;

  await db().collection("audit_logs").add({
    type: "PLAID_LINK_TOKEN_CREATED",
    uid: input.uid,
    updateMode: isUpdateMode,
    createdAt: new Date(),
  });

  return { link_token: linkToken };
}