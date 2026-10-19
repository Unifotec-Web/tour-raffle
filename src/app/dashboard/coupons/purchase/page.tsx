'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Order, orderRequest } from '@/lib/orders';

type Provider = 'fake' | 'stripe' | 'paystack';
export default function PurchaseCouponsPage() {
  const router = useRouter();
  const [selectedQty, setSelectedQty] = useState(10);
  const [campaignId, setCampaignId] = useState('');
  const [providers, setProviders] = useState<Record<Provider, boolean>>({ fake: false, stripe: false, paystack: false });
  const [provider, setProvider] = useState<Provider>('fake');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const attemptKey = useRef('');
  useEffect(() => {
    Promise.all([orderRequest<{ id: string; status: string }>('/campaigns/featured/progress'), orderRequest<Record<Provider, boolean>>('/payments/providers')])
      .then(([campaign, available]) => { setCampaignId(campaign.status === 'open' ? campaign.id : ''); setProviders(available); setProvider((Object.keys(available) as Provider[]).find(key => available[key]) || 'fake'); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  async function proceed() {
    if (!campaignId) { setError('Registration is closed. Checkout is unavailable.'); return; }
    setSubmitting(true); setError('');
    try {
      if (!attemptKey.current) attemptKey.current = crypto.randomUUID();
      const order = await orderRequest<Order>('/orders', { method: 'POST', body: JSON.stringify({ campaign_id: campaignId, quantity: selectedQty, provider, idempotency_key: attemptKey.current }) });
      router.push(`/dashboard/checkout?order=${order.id}`);
    } catch (e) { setError((e as Error).message); setSubmitting(false); }
  }
  const methods: { id: Provider; title: string; subtitle: string }[] = [
    { id: 'stripe', title: 'Credit / Debit Card', subtitle: 'Stripe sandbox' },
    { id: 'paystack', title: 'Paystack', subtitle: 'Paystack sandbox' },
    { id: 'fake', title: 'Local Test Payment', subtitle: 'Local fixture only' },
  ];
  return <DashboardLayout><div className="space-y-8 max-w-4xl mx-auto">
    <div className="text-center space-y-2"><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Purchase Coupons</h1><p className="text-mutedBlue text-sm">Choose the number of coupons you want to buy and complete your payment securely.</p></div>
    <div className="flex items-center justify-center gap-4 text-xs font-bold text-mutedBlue"><span className="flex items-center gap-1.5 text-primary"><span className="w-6 h-6 rounded-full bg-accent text-primary flex items-center justify-center">1</span> Select Quantity</span><span>---</span><span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-borderBlue text-mutedBlue flex items-center justify-center">2</span> Payment</span><span>---</span><span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-borderBlue text-mutedBlue flex items-center justify-center">3</span> Confirmation</span></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 5, 10, 20].map(qty => <button type="button" key={qty} onClick={() => { setSelectedQty(qty); attemptKey.current = crypto.randomUUID(); }} className={`cursor-pointer rounded-2xl p-5 border text-center transition-all relative ${selectedQty === qty ? 'border-secondary bg-lightBlue shadow-md ring-2 ring-secondary/30' : 'border-borderBlue bg-white hover:border-secondary/50'}`}>{qty === 10 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-sm">Most Popular</span>}<h3 className="font-bold text-primary text-base mb-1">{qty} Coupon{qty > 1 ? 's' : ''}</h3><div className="text-2xl font-extrabold text-primary mb-1">${qty * 10}.00</div><span className="text-[11px] text-mutedBlue font-medium block">$10.00 USD each</span></button>)}</div>
    <div className="bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6"><h3 className="text-xl font-extrabold text-primary tracking-tight">Checkout &amp; Payment</h3>
      <div className="space-y-3"><label className="block text-xs font-bold text-primary">Payment Method</label><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{methods.filter(item => providers[item.id]).map(item => <button type="button" key={item.id} onClick={() => { setProvider(item.id); attemptKey.current = crypto.randomUUID(); }} className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors text-left ${provider === item.id ? 'border-secondary bg-lightBlue ring-2 ring-secondary/30' : 'border-borderBlue bg-white hover:border-secondary/50'}`}><div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-secondary"/><div><span className="font-bold text-primary text-sm block">{item.title}</span><span className="text-[11px] text-mutedBlue">{item.subtitle}</span></div></div><span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${provider === item.id ? 'border-secondary' : 'border-borderBlue'}`}>{provider === item.id && <span className="w-2 h-2 rounded-full bg-secondary"/>}</span></button>)}</div>{!loading && !Object.values(providers).some(Boolean) && <p className="text-xs text-mutedBlue">Sandbox checkout is unavailable until a payment provider is configured.</p>}</div>
      <div className="bg-lightBlue border border-borderBlue rounded-xl p-5 space-y-3"><h4 className="font-bold text-primary text-sm">Order Summary</h4><div className="flex justify-between text-xs text-mutedBlue"><span>{selectedQty} Coupons × $10.00</span><span className="font-semibold text-primary">${selectedQty * 10}.00</span></div><div className="flex justify-between text-sm font-extrabold text-primary pt-3 border-t border-borderBlue"><span>Total Amount</span><span className="text-secondary">${selectedQty * 10}.00 USD</span></div></div>
      <div className="flex items-center gap-2 text-xs text-mutedBlue"><ShieldCheck className="w-4 h-4 text-success shrink-0"/><span>Payment is confirmed by the provider before coupons are issued. Register your coupons before closure to enter the draw.</span></div>
      {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary hover:underline">Sign in again</Link>}</p>}
      <button disabled={loading || submitting || !campaignId || !providers[provider]} onClick={proceed} className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-all text-sm disabled:opacity-50">{submitting ? 'Creating checkout...' : 'Proceed to Checkout →'}</button>
    </div>
  </div></DashboardLayout>;
}
