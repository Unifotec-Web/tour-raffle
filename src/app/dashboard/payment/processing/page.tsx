'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Loader2, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { Order, orderRequest } from '@/lib/orders';

export default function ProcessingPaymentPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('order');
    if (!id) { setError('Order reference is missing.'); return; }
    let active = true;
    async function poll() {
      try { const data = await orderRequest<Order>(`/orders/${id}`); if (active) { setOrder(data); setError(''); } }
      catch (e) { if (active) setError((e as Error).message); }
    }
    poll(); const timer = window.setInterval(poll, 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const status = order?.status;
  const success = status === 'issued';
  const failed = status === 'failed' || status === 'cancelled' || status === 'hold_expired';
  const review = status === 'reconciliation_required';
  return <DashboardLayout><div className="space-y-8 max-w-xl mx-auto text-center py-12"><div className="bg-white border border-borderBlue rounded-2xl p-10 shadow-card space-y-6">
    {success ? <CheckCircle2 className="w-12 h-12 text-success mx-auto"/> : failed || review ? <XCircle className="w-12 h-12 text-red-500 mx-auto"/> : <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto"/>}
    <div><h1 className="text-2xl font-extrabold text-primary tracking-tight">{success ? 'Payment Successful!' : review ? 'Payment needs review' : failed ? 'Checkout not completed' : 'Processing your payment...'}</h1><p className="text-mutedBlue text-xs mt-1">{success ? 'Your coupons are ready. Register each coupon before registration closes to enter the draw.' : review ? 'Payment was recorded, but capacity was no longer available. A remedy review is required.' : failed ? 'No coupons were issued for this order.' : 'Waiting for verified provider confirmation. You can leave this page and return later.'}</p></div>
    {order && <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 text-left text-xs text-textBlue"><p>Order: <strong className="font-mono">{order.id}</strong></p><p>Amount: <strong>${order.total_amount} {order.currency}</strong></p><p>Status: <strong>{status?.replaceAll('_', ' ')}</strong></p></div>}
    {!success && !failed && !review && <div className="space-y-3 text-left text-xs pt-4 max-w-xs mx-auto text-textBlue"><div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-success"/> Checkout requested</div><div className="flex items-center gap-3"><Loader2 className="w-4 h-4 text-secondary animate-spin"/> Waiting for provider verification</div><div className="flex items-center gap-3 text-mutedBlue"><Circle className="w-4 h-4 text-borderBlue"/> Issuing your coupons after verification</div></div>}
    {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary">Sign in again</Link>}</p>}
    <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center"><Link href="/dashboard/coupons" className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-colors text-sm">View Coupons</Link><Link href="/dashboard/payments" className="bg-white hover:bg-lightBlue text-primary font-semibold px-6 py-3 rounded-pill border border-borderBlue transition-colors text-sm shadow-sm">Payment History</Link></div>
  </div></div></DashboardLayout>;
}
