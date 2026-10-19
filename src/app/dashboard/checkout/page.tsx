'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Order, orderRequest } from '@/lib/orders';

export default function CheckoutPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order'); setCancelled(params.get('cancelled') === '1');
    if (!id) { setError('Select coupons to begin checkout.'); setLoading(false); return; }
    orderRequest<Order>(`/orders/${id}`).then(setOrder).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  async function pay() {
    if (!order) return;
    setSubmitting(true); setError('');
    try {
      const checkout = await orderRequest<Order>(`/orders/${order.id}/checkout`, { method: 'POST' });
      setOrder(checkout);
      if (checkout.provider === 'fake') {
        await orderRequest<Order>(`/test/orders/${checkout.id}/confirm`, { method: 'POST' });
        router.push(`/dashboard/payment/processing?order=${checkout.id}`);
      } else if (checkout.checkout_url) {
        window.location.assign(checkout.checkout_url);
      } else throw new Error('Checkout URL is unavailable.');
    } catch (e) { setError((e as Error).message); setSubmitting(false); }
  }
  async function cancel() {
    if (!order) return;
    setSubmitting(true); setError('');
    try { setOrder(await orderRequest<Order>(`/orders/${order.id}/cancel`, { method: 'POST' })); }
    catch (e) { setError((e as Error).message); } finally { setSubmitting(false); }
  }
  return <DashboardLayout><div className="space-y-8 max-w-3xl mx-auto">
    <div className="text-center space-y-2"><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Checkout</h1><p className="text-mutedBlue text-sm">Complete your purchase by selecting a payment method.</p></div>
    <div className="bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6">
      <h3 className="text-xl font-extrabold text-primary">Payment Method</h3>
      {loading && <p className="text-xs text-mutedBlue">Loading your order...</p>}
      {order && <div className="border border-secondary bg-lightBlue ring-2 ring-secondary/30 rounded-xl p-4 flex items-center justify-between"><div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-secondary"/><div><span className="font-bold text-primary text-sm block">{order.provider === 'fake' ? 'Local Test Payment' : order.provider === 'stripe' ? 'Credit / Debit Card' : 'Paystack'}</span><span className="text-[11px] text-mutedBlue">{order.provider === 'fake' ? 'Fixture payment only' : 'Provider sandbox checkout'}</span></div></div><span className="w-4 h-4 rounded-full border-2 border-secondary flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-secondary"/></span></div>}
      <div className="flex items-start gap-2 pt-2"><input type="checkbox" id="checkout-terms" defaultChecked className="mt-0.5 rounded border-borderBlue text-secondary focus:ring-secondary"/><label htmlFor="checkout-terms" className="text-xs text-mutedBlue leading-tight">I agree to the <Link href="/legal/terms" className="text-secondary font-semibold hover:underline">Terms &amp; Conditions</Link> and <Link href="/legal/privacy" className="text-secondary font-semibold hover:underline">Privacy Policy</Link></label></div>
      <div className="bg-lightBlue border border-borderBlue rounded-xl p-5 space-y-3"><h4 className="font-bold text-primary text-sm">Order Summary</h4><div className="flex justify-between text-xs text-mutedBlue"><span>{order ? `${order.quantity} Coupons × $10.00` : 'Coupons'}</span><strong className="text-primary">{order ? `$${order.total_amount}` : '—'}</strong></div><div className="flex justify-between text-sm font-extrabold text-primary pt-3 border-t border-borderBlue"><span>Total Amount</span><span className="text-secondary">{order ? `$${order.total_amount} ${order.currency}` : '—'}</span></div></div>
      <div className="flex items-center gap-2 text-xs text-mutedBlue"><ShieldCheck className="w-4 h-4 text-success shrink-0"/><span>A provider confirmation is required before coupons are issued.</span></div>
      {cancelled && <p className="text-xs text-warning">You returned from checkout. We will keep checking for provider confirmation until the hold expires.</p>}
      {order && <p className="text-xs text-mutedBlue">Status: {order.status.replaceAll('_', ' ')} · Hold expires {order.hold_expires_at ? new Date(order.hold_expires_at).toLocaleString() : '—'}</p>}
      {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary">Sign in again</Link>}</p>}
      {order && ['held', 'checkout_pending'].includes(order.status) && <button disabled={submitting} onClick={pay} className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm disabled:opacity-50">{submitting ? 'Opening checkout...' : `Pay Now ($${order.total_amount})`}</button>}
      {order && ['held', 'checkout_pending'].includes(order.status) && <button disabled={submitting} onClick={cancel} className="block w-full text-center text-xs font-semibold text-mutedBlue hover:text-primary">Cancel order</button>}
      {order && !['held', 'checkout_pending'].includes(order.status) && <Link href={`/dashboard/payment/processing?order=${order.id}`} className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm">View payment status</Link>}
    </div>
  </div></DashboardLayout>;
}
