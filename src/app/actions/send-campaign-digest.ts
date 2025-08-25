"use server";

/**
 * src/app/actions/send-campaign-digest.ts
 *
 * Builds a digest of recent campaign activity and emails it to recipients.
 * If SENDGRID_API_KEY is missing, we fall back to logging the digest in Firestore.
 *
 * Collections expected (adjust as needed):
 * - campaigns          : { id, name, createdAt, status, ... }
 * - campaign_sends     : { campaignId, status, sentAt, opened, clicked, ... }
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

// -------- Minimal Firebase Admin helper ----------
function adminApp() {
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_ADMIN_CERT_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_CERT_B64, "base64").toString("utf8")
      : "{}";
    initializeApp({ credential: cert(JSON.parse(json)) });
  }
  return getApps()[0];
}
function db() {
  return getFirestore(adminApp());
}
// ------------------------------------------------

type DigestOpts = {
  hours?: number;                // default 24
  toEmails?: string[];           // recipients
  subject?: string;              // email subject
  fromEmail?: string;            // sender
};

async function buildDigest(hours = 24) {
  const now = Timestamp.now();
  const since = Timestamp.fromMillis(now.toMillis() - hours * 60 * 60 * 1000);

  const campaignsSnap = await db()
    .collection("campaigns")
    .where("createdAt", ">", since)
    .get()
    .catch(() => null);

  const campaigns = campaignsSnap?.docs.map((d) => ({ id: d.id, ...d.data() })) || [];

  // roll up basic send stats per campaign
  const stats: Record<string, { sent: number; opened: number; clicked: number }> = {};

  for (const c of campaigns) {
    const sendsSnap = await db()
      .collection("campaign_sends")
      .where("campaignId", "==", c.id)
      .where("sentAt", ">", since)
      .get()
      .catch(() => null);

    let sent = 0;
    let opened = 0;
    let clicked = 0;

    if (sendsSnap && !sendsSnap.empty) {
      sendsSnap.forEach((d) => {
        const sd = d.data();
        if (sd.status === "SENT") sent += 1;
        if (sd.opened === true) opened += 1;
        if (sd.clicked === true) clicked += 1;
      });
    }
    stats[c.id] = { sent, opened, clicked };
  }

  return { from: since.toDate().toISOString(), to: now.toDate().toISOString(), campaigns, stats };
}

async function sendWithSendGrid(to: string[], subject: string, html: string, fromEmail?: string) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;

  // Lazy import to avoid bundling at build if not configured
  const sgMail = await import("@sendgrid/mail").catch(() => null);
  if (!sgMail) return false;

  sgMail.default.setApiKey(key);
  const msg = {
    to,
    from: fromEmail || "no-reply@flowbank.ai",
    subject,
    html,
  };

  try {
    await sgMail.default.sendMultiple(msg as any);
    return true;
  } catch {
    return false;
  }
}

function renderDigestHTML(digest: any) {
  const rows =
    digest.campaigns.length === 0
      ? `<tr><td colspan="4">No campaigns in range.</td></tr>`
      : digest.campaigns
          .map((c: any) => {
            const s = digest.stats[c.id] || { sent: 0, opened: 0, clicked: 0 };
            return `<tr>
              <td>${c.name || c.id}</td>
              <td>${s.sent}</td>
              <td>${s.opened}</td>
              <td>${s.clicked}</td>
            </tr>`;
          })
          .join("");

  return `
  <h2>Campaign Digest</h2>
  <p>Window: <strong>${digest.from}</strong> to <strong>${digest.to}</strong></p>
  <table border="1" cellpadding="6" cellspacing="0">
    <thead>
      <tr><th>Campaign</th><th>Sent</th><th>Opened</th><th>Clicked</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export async function sendCampaignDigest(opts: DigestOpts = {}) {
  const hours = typeof opts.hours === "number" ? opts.hours : 24;
  const toEmails = opts.toEmails?.length ? opts.toEmails : [];
  const subject = opts.subject || `Campaign Digest (last ${hours}h)`;
  const fromEmail = opts.fromEmail;

  const digest = await buildDigest(hours);
  const html = renderDigestHTML(digest);

  let sent = false;
  if (toEmails.length > 0) {
    sent = await sendWithSendGrid(toEmails, subject, html, fromEmail);
  }

  if (!sent) {
    // Fallback: store the digest in Firestore so you can view it in the admin
    await db().collection("campaign_digests").add({
      createdAt: new Date(),
      hours,
      digest,
      subject,
      note: "SendGrid not configured; saved digest instead of emailing.",
    });
  }

  // Write an audit record either way
  await db().collection("audit_logs").add({
    type: "CAMPAIGN_DIGEST",
    recipients: toEmails,
    sent,
    createdAt: new Date(),
  });

  return { ok: true, sent, recipients: toEmails, hours };
}