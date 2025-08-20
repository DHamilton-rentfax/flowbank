'use server';

import { db } from '@/firebase/server';
import { stripe } from '@/lib/stripe';
import {
  syncCustomerSubscription,
  recordInvoiceEvent,
  recordPaymentEvent,
  recordRefundEvent,
  recordDisputeEvent
} from '@/app/actions/stripe-sync';

export type AuditLog = {
  id: string;
  type: string;               // e.g., 'INVOICE:invoice.payment_succeeded'
  source?: string;            // optional: 'stripe' | 'plaid' | ...
  stripeCustomerId?: string | null;
  payload?: any;
  ts: number;
  userId?: string | null;
};

export type DLQItem = {
  id: string;
  source: 'stripe' | 'plaid' | string;
  type: string;     // original event type (e.g. 'invoice.payment_failed')
  payload: any;     // the original event payload/object
  error?: string;   // error captured at failure
  ts: number;
};

function snapToAudit(doc: FirebaseFirestore.QueryDocumentSnapshot): AuditLog {
  return { id: doc.id, ...(doc.data() as any) };
}
function snapToDLQ(doc: FirebaseFirestore.QueryDocumentSnapshot): DLQItem {
  return { id: doc.id, ...(doc.data() as any) };
}

export async function listAuditLogs(params: {
  limit?: number;
  beforeTs?: number;        // pagination: fetch < ts
  source?: string;          // e.g. 'stripe'
  typePrefix?: string;      // e.g. 'INVOICE:' or 'PAYMENT:'
}) {
  const { limit = 50, beforeTs, source, typePrefix } = params || {};
  let q = db.collection('audit_logs').orderBy('ts', 'desc').limit(limit);

  if (beforeTs) q = q.startAfter(beforeTs);
  if (source) q = q.where('source', '==', source);
  if (typePrefix) q = q.where('type', '>=', typePrefix).where('type', '<', typePrefix + '');

  const snap = await q.get();
  const items = snap.docs.map(snapToAudit);
  const nextCursor = items.length ? items[items.length - 1].ts : null;
  return { items, nextCursor };
}

export async function listDLQ(params: {
  limit?: number;
  beforeTs?: number; // pagination
  source?: string;
}) {
  const { limit = 50, beforeTs, source } = params || {};
  let q = db.collection('webhook_dlq').orderBy('ts', 'desc').limit(limit);
  if (beforeTs) q = q.startAfter(beforeTs);
  if (source) q = q.where('source', '==', source);

  const snap = await q.get();
  const items = snap.docs.map(snapToDLQ);
  const nextCursor = items.length ? items[items.length - 1].ts : null;
  return { items, nextCursor };
}

export async function deleteDLQEntry(id: string) {
  await db.collection('webhook_dlq').doc(id).delete();
  await db.collection('audit_logs').add({ type: 'DLQ:DELETE', payload: { id }, ts: Date.now() });
  return { ok: true };
}

/** Replays a DLQ entry by routing its payload back through the same handlers you use in your webhook switch. */
export async function replayDLQEntry(id: string) {
  const ref = db.collection('webhook_dlq').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return { ok: false, error: 'DLQ entry not found' };
  const { source, type, payload } = doc.data() as DLQItem;

  try {
    if (source === 'stripe') {
      await replayStripe(type, payload);
    } else if (source === 'plaid') {
      // You can wire Plaid replay here if needed
      await db.collection('audit_logs').add({ type: `PLAID_REPLAY:${type}`, payload, ts: Date.now(), source: 'plaid' });
    } else {
      throw new Error(`Unsupported source: ${source}`);
    }

    await db.collection('audit_logs').add({ type: `DLQ:REPLAY:${source}:${type}`, payload: { id }, ts: Date.now() });
    return { ok: true };
  } catch (e: any) {
    await db.collection('audit_logs').add({ type: `DLQ:REPLAY_FAILED:${source}:${type}`, payload: { id, error: e?.message || String(e) }, ts: Date.now() });
    return { ok: false, error: e?.message || 'Replay failed' };
  }
}

// Minimal replay logic that mirrors your webhook route behavior
async function replayStripe(type: string, obj: any) {
  // Some events carry 'customer' directly, others inside nested objects.
  const getCustomerId = (): string | null => {
    if (!obj) return null;
    if (typeof obj.customer === 'string') return obj.customer;
    if (obj.customer && typeof obj.customer.id === 'string') return obj.customer.id;
    if (obj.charge && typeof obj.charge.customer === 'string') return obj.charge.customer;
    return null;
  };

  switch (true) {
    case type.startsWith('checkout.session.'): {
      const customerId = getCustomerId();
      if (customerId) await syncCustomerSubscription(customerId);
      break;
    }
    case type.startsWith('customer.subscription.'): {
      const customerId = getCustomerId();
      if (customerId) await syncCustomerSubscription(customerId);
      break;
    }
    case type.startsWith('invoice.'): {
      await recordInvoiceEvent(type, obj);
      const customerId = getCustomerId();
      if (customerId && (type === 'invoice.payment_succeeded' || type === 'invoice.payment_failed')) {
        await syncCustomerSubscription(customerId);
      }
      break;
    }
    case type.startsWith('payment_intent.'): {
      await recordPaymentEvent(type, obj);
      break;
    }
    case type.startsWith('charge.'): {
      await recordPaymentEvent(type, null, obj);
      break;
    }
    case type.startsWith('refund.'): {
      await recordRefundEvent(obj);
      break;
    }
    case type.startsWith('charge.dispute.'): {
      await recordDisputeEvent(type, obj);
      break;
    }
    default: {
      // No-op but record we saw it
      await db.collection('audit_logs').add({ type: `STRIPE_REPLAY_NOOP:${type}`, payload: { id: obj?.id }, ts: Date.now(), source: 'stripe' });
    }
  }
}