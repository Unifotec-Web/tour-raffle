'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Order, orderRequest } from '@/lib/orders';

export default function MyPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  useEffect(() => { orderRequest<Order[]>('/users/me/orders').then(setOrders).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const paid = orders.filter(o => o.paid_at !== null);
  const pending = orders.filter(o => ['held', 'checkout_pending', 'paid_pending_issuance'].includes(o.status));
  const failed = orders.filter(o => ['failed', 'cancelled', 'hold_expired', 'reconciliation_required'].includes(o.status));
  const visible = useMemo(() => orders.filter(o => filter === 'all' || (filter === 'successful' && o.status === 'issued') || (filter === 'pending' && ['held', 'checkout_pending', 'paid_pending_issuance'].includes(o.status)) || (filter === 'failed' && ['failed', 'cancelled', 'hold_expired', 'reconciliation_required'].includes(o.status))), [orders, filter]);
  const total = paid.reduce((value, o) => value + Number(o.paid_amount || 0), 0);
  return <DashboardLayout><div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">My Payments</h1><p className="text-mutedBlue text-sm">Manage your payments and view your payment history.</p></div><Link href="/dashboard/coupons/purchase" className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm">Make a Payment</Link></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Total Paid', value: loading || error ? '—' : `$${total.toFixed(2)}`, icon: CreditCard, color: 'text-secondary', bg: 'bg-lightBlue border-borderBlue' },
        { label: 'Successful Payments', value: loading || error ? '—' : orders.filter(o => o.status === 'issued').length, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10 border-success/30' },
        { label: 'Pending Payments', value: loading || error ? '—' : pending.length, icon: Clock, color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
        { label: 'Failed / Review', value: loading || error ? '—' : failed.length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
      ].map(card => <div key={card.label} className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between"><div><span className="text-mutedBlue text-xs block mb-1">{card.label}</span><span className={`text-2xl font-extrabold ${card.color}`}>{card.value}</span></div><div className={`w-10 h-10 rounded-full border flex items-center justify-center ${card.bg} ${card.color}`}><card.icon className="w-5 h-5"/></div></div>)}
    </div>
    <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
      {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary">Sign in again</Link>}</p>}
      <div className="flex flex-wrap items-center gap-2">{['all','successful','pending','failed'].map(status => <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${filter === status ? 'bg-primary text-white font-bold shadow-sm' : 'bg-lightBlue text-primary hover:bg-borderBlue'}`}>{status === 'all' ? 'All Payments' : status[0].toUpperCase() + status.slice(1)}</button>)}</div>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-borderBlue text-mutedBlue font-semibold"><th className="pb-3 px-4">Date</th><th className="pb-3 px-4">Reference</th><th className="pb-3 px-4">Description</th><th className="pb-3 px-4">Amount</th><th className="pb-3 px-4">Status</th><th className="pb-3 px-4 text-right">Details</th></tr></thead><tbody className="divide-y divide-borderBlue text-primary font-medium">
        {loading && <tr><td colSpan={6} className="py-8 px-4 text-center text-mutedBlue">Loading payments...</td></tr>}
        {!loading && !error && visible.length === 0 && <tr><td colSpan={6} className="py-8 px-4 text-center text-mutedBlue">No payments found.</td></tr>}
        {visible.map(o => <tr key={o.id} className="hover:bg-lightBlue/40 transition-colors"><td className="py-3.5 px-4 text-mutedBlue">{new Date(o.created_at).toLocaleDateString()}</td><td className="py-3.5 px-4 font-mono font-bold text-secondary">{o.reference || o.id.slice(0, 8)}</td><td className="py-3.5 px-4">{o.quantity} Coupon{o.quantity === 1 ? '' : 's'} Purchase</td><td className="py-3.5 px-4 font-bold">${o.paid_amount || o.total_amount} {o.paid_currency || o.currency}</td><td className="py-3.5 px-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${o.status === 'issued' ? 'bg-success/15 text-success border-success/30' : o.status === 'reconciliation_required' ? 'bg-red-500/15 text-red-500 border-red-500/30' : 'bg-warning/15 text-warning border-warning/30'}`}>{o.status.replaceAll('_', ' ')}</span></td><td className="py-3.5 px-4 text-right"><Link href={`/dashboard/payment/processing?order=${o.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderBlue bg-lightBlue text-primary text-[11px] font-semibold hover:bg-white transition-colors shadow-sm">View</Link></td></tr>)}
      </tbody></table></div>
    </div>
  </div></DashboardLayout>;
}
