"use server";

/**
 * src/app/actions/export-campaign-data.ts
 *
 * Exports campaign summaries (and optionally recent sends) from Firestore.
 * No imports from local libs — uses an inline Firebase Admin helper.
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ---------- Minimal Firebase Admin helper ----------
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
// ---------------------------------------------------

export type ExportCampaignOptions = {
  /** Only include campaigns created in the last N days (default 90) */
  sinceDays?: number;
  /** Include campaign_sends rows (default true) */
  includeSends?: boolean;
  /** Max sends to pull per campaign (default 200) */
  sendsLimitPerCampaign?: number;
};

type Metrics = { sent?: number; opened?: number; clicked?: number };

export type ExportCampaignRow = {
  id: string;
  name?: string;
  status?: string;
  createdAt?: any; // keep Firestore Timestamp as‑is for callers that expect it
  metrics: { sent: number; opened: number; clicked: number };
  sends?: any[];
};

export type ExportCampaignResult = {
  generatedAt: string;
  count: number;
  campaigns: ExportCampaignRow[];
};

export async function exportCampaignData(
  opts: ExportCampaignOptions = {}
): Promise<ExportCampaignResult> {
  const sinceDays = Number.isFinite(opts.sinceDays) ? Number(opts.sinceDays) : 90;
  const includeSends = opts.includeSends !== false; // default true
  const sendsLimit = Math.max(1, Math.min(2000, Number(opts.sendsLimitPerCampaign ?? 200)));

  const sinceDate = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

  // 1) Try to query with an index; if it fails (missing index), fall back to client-side filter.
  let campaignDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[];
  try {
    const snap = await db()
      .collection("campaigns")
      .where("createdAt", ">=", sinceDate)
      .orderBy("createdAt", "desc")
      .get();
    campaignDocs = snap.docs;
  } catch {
    const all = await db().collection("campaigns").orderBy("createdAt", "desc").get();
    campaignDocs = all.docs.filter((d) => {
      const dt = d.data()?.createdAt;
      const t =
        dt?.toDate?.() instanceof Date
          ? (dt as any).toDate()
          : dt?._seconds
          ? new Date(dt._seconds * 1000)
          : undefined;
      return !t || t >= sinceDate;
    });
  }

  const results: ExportCampaignRow[] = [];

  for (const d of campaignDocs) {
    const data = d.data() || {};
    const metrics: Metrics = data.metrics || {};

    const row: ExportCampaignRow = {
      id: d.id,
      name: data.name || data.title || "",
      status: data.status || data.state || "",
      createdAt: data.createdAt || null,
      metrics: {
        sent: Number(metrics.sent ?? 0),
        opened: Number(metrics.opened ?? 0),
        clicked: Number(metrics.clicked ?? 0),
      },
    };

    if (includeSends) {
      // Pull recent sends from a flat collection "campaign_sends"
      const sendsSnap = await db()
        .collection("campaign_sends")
        .where("campaignId", "==", d.id)
        .orderBy("createdAt", "desc")
        .limit(sendsLimit)
        .get()
        .catch(() => null);

      if (sendsSnap && !sendsSnap.empty) {
        row.sends = sendsSnap.docs.map((s) => ({ id: s.id, ...s.data() }));
      } else {
        row.sends = [];
      }
    }

    results.push(row);
  }

  return {
    generatedAt: new Date().toISOString(),
    count: results.length,
    campaigns: results,
  };
}