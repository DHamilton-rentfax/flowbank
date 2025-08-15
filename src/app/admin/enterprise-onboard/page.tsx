
"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const INCLUDED_SEATS = 10;
const PRICE_BASE_MONTH = 249;
const PRICE_SEAT = 8;

export default function EnterpriseOnboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [interval, setInterval] = useState('month'); // 'month' | 'year'
  const [seats, setSeats] = useState(15);
  const [trialDays, setTrialDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('checkout'); // 'checkout' | 'direct'
  
  // In a real app, you'd derive this from user claims.
  // For now, we'll just check if the user is logged in.
  const isAllowed = !!user;

  const extraSeats = useMemo(() => Math.max(0, (Number(seats) || INCLUDED_SEATS) - INCLUDED_SEATS), [seats]);
  const estMonthly = useMemo(() => PRICE_BASE_MONTH + extraSeats * PRICE_SEAT, [extraSeats]);

  async function getIdToken() {
    const currentUser = getAuth().currentUser;
    if (!currentUser) throw new Error('Please sign in first.');
    return currentUser.getIdToken();
  }

  async function start() {
    setLoading(true);
    try {
      const token = await getIdToken();
      const url = mode === 'checkout' ? '/api/enterprise/create-checkout' : '/api/enterprise/create-subscription';
      const body = mode === 'checkout'
        ? { seats: Number(seats), interval }
        : { seats: Number(seats), interval, trialDays: Number(trialDays) || 0 };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Request failed');

      if (mode === 'checkout') {
        window.location.assign(json.url);
      } else {
        toast({ title: "Subscription Created", description: `ID: ${json.id} (${json.status})`});
      }
    } catch (e) {
      const error = e as Error;
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (!isAllowed) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center p-6">Not authorized.</main>
            <Footer />
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="max-w-3xl mx-auto p-6 space-y-6 flex-1">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Enterprise Onboarding</h1>
                <Link href="/rules" className="text-sm underline">Allocation Rules</Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <section className="border rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold">Plan configuration</h2>

                <label className="block text-sm">
                    Billing interval
                    <select value={interval} onChange={(e)=>setInterval(e.target.value)} className="mt-1 w-full border rounded px-2 py-2 bg-background">
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    </select>
                </label>

                <label className="block text-sm">
                    Total seats (includes {INCLUDED_SEATS})
                    <input type="number" min={INCLUDED_SEATS} value={seats} onChange={(e)=>setSeats(e.target.value)} className="mt-1 w-full border rounded px-2 py-2 bg-background" />
                </label>

                <label className="block text-sm">
                    Trial days (direct-create only)
                    <input type="number" min={0} value={trialDays} onChange={(e)=>setTrialDays(e.target.value)} className="mt-1 w-full border rounded px-2 py-2 bg-background" />
                </label>

                <fieldset className="block text-sm">
                    <legend className="mb-2">Onboarding mode</legend>
                    <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                        <input type="radio" name="mode" value="checkout" checked={mode==='checkout'} onChange={()=>setMode('checkout')} />
                        <span>Stripe Checkout (recommended)</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="radio" name="mode" value="direct" checked={mode==='direct'} onChange={()=>setMode('direct')} />
                        <span>Create subscription directly</span>
                    </label>
                    </div>
                </fieldset>

                <button onClick={start} disabled={loading} className="w-full mt-2 px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60">
                    {loading ? 'Processing…' : (mode==='checkout' ? 'Open Checkout' : 'Create Subscription')}
                </button>
                </section>

                <aside className="border rounded-2xl p-5 space-y-3">
                <h2 className="font-semibold">Estimate (reference only)</h2>
                <div className="text-sm text-gray-600">
                    <div className="flex justify-between py-1"><span>Base (10 seats)</span><span>${PRICE_BASE_MONTH.toFixed(0)} / mo</span></div>
                    <div className="flex justify-between py-1"><span>Extra seats ({extraSeats} × ${PRICE_SEAT})</span><span>${(extraSeats * PRICE_SEAT).toFixed(0)} / mo</span></div>
                    <div className="border-t my-2" />
                    <div className="flex justify-between font-semibold"><span>Estimated total</span><span>${estMonthly.toFixed(0)} / mo</span></div>
                    <p className="mt-3 text-xs">Exact charges come from Stripe. Taxes/add‑ons not included.</p>
                </div>
                <div className="pt-4">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <ul className="text-sm list-disc pl-5 space-y-1 text-gray-600">
                    <li>The first {INCLUDED_SEATS} seats are included in the base Enterprise price.</li>
                    <li>Extra seats are billed separately.</li>
                    <li>Yearly billing uses your `enterprise_base_year_usd` price if configured.</li>
                    </ul>
                </div>
                </aside>
            </div>
        </main>
        <Footer />
    </div>
  );
}
