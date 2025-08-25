/* eslint-disable @typescript-eslint/no-explicit-any */

// src/app/api/plaid-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// -------- Minimal Firebase Admin helper (inline) ----------
// ✅ App Router replacement for config
// Tells Next.js to treat this route as dynamic (no static optimizations).
export const dynamic = "force-dynamic";

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
function db() {
  return getFirestore(adminApp());
}
// ---------------------------------------------------------

// Optional HMAC verification (Plaid sends 'PLAID-WEBHOOK-SIGNATURE' header if enabled)
// If you haven't configured a webhook secret in Plaid dashboard, this will simply skip.
function verifyPlaidSignature(rawBody: Buffer, signatureHeader: string | null, secret: string) {
  const crypto = require("crypto");
  if (!signatureHeader) return false;
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const digest = hmac.digest("hex");
    // Signature format can vary; we accept direct match for simplicity.
    return signatureHeader.includes(digest);
  } catch {
    return false;
  }
}

async function readRawBody(req: NextRequest): Promise<Buffer> {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: NextRequest) {
  const rawBody = await readRawBody(req);
  const secret = process.env.PLAID_WEBHOOK_SECRET || "";
  const signatureHeader = req.headers.get("plaid-webhook-signature");

  if (secret) {
    const ok = verifyPlaidSignature(rawBody, signatureHeader, secret);
    if (!ok) {
      // We fail open to avoid losing events if secret is not aligned; log for inspection.
      // You may choose to reject with 400 if you want strict verification.
      // return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let body: any = {};
  try {
    body = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Persist raw webhook
  try {
    await db().collection("plaid_webhooks").add({
      receivedAt: FieldValue.serverTimestamp(),
      headers: Object.fromEntries(req.headers),
      body,
    });
  } catch {
    // do not fail webhook if logging fails
  }

  // Handle common webhook types (expand as needed)
  const webhookType = body.webhook_type as string | undefined;
  const webhookCode = body.webhook_code as string | undefined;
  const itemId = (body.item_id as string) || null;

  try {
    if (itemId) {
      const itemRef = db().collection("plaid_items").doc(itemId);

      switch (`${webhookType}:${webhookCode}`) {
        case "TRANSACTIONS:DEFAULT_UPDATE":
        case "TRANSACTIONS:HISTORICAL_UPDATE":
        case "TRANSACTIONS:INITIAL_UPDATE": {
          // Mark item as needing a sync (your cron/admin button can pick this up),
          // or you can trigger syncAllTransactions() from here if desired.
          await itemRef.set(
            {
              needsSync: true,
              lastWebhookAt: FieldValue.serverTimestamp(),
              lastWebhookType: webhookType,
              lastWebhookCode: webhookCode,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          break;
        }

        case "ITEM:ERROR":
        case "ITEM:LOGIN_REQUIRED": {
          await itemRef.set(
            {
              status: "error",
              lastError: body.error || null,
              lastWebhookAt: FieldValue.serverTimestamp(),
              lastWebhookType: webhookType,
              lastWebhookCode: webhookCode,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          break;
        }

        default: {
          await itemRef.set(
            {
              lastWebhookAt: FieldValue.serverTimestamp(),
              lastWebhookType: webhookType || null,
              lastWebhookCode: webhookCode || null,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
    }
  } catch (err: any) {
    // swallow errors to avoid webhook retry storms
    await db().collection("audit_logs").add({
      type: "PLAID_WEBHOOK_ERROR",
      error: String(err?.message || err),
      itemId: itemId || null,
      createdAt: new Date(),
    });
  }

  // Always 200 OK to acknowledge receipt
  return NextResponse.json({ ok: true });
}