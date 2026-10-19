'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Order, orderRequest } from '@/lib/orders';

export default function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { orderRequest<Order>(`/orders/${id}`).then(setOrder).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [id]);
  const next = order?.remedy_status !== 'none' ? 'Your payment needs review. We will update this record after a reviewer checks it.'
    : order?.issuance_status === 'issued' ? 'Your coupons are in My Coupons. Register them before the campaign closes to qualify for the draw.'
    : order?.payment_status === 'paid' ? 'Payment is recorded. Coupon issuance is being checked.'
    : order?.status === 'hold_expired' ? 'Your checkout hold expired. Start a new checkout if registration remains open.'
    : 'Payment has not been verified. You can return to checkout while your hold is active.';
  return <DashboardLayout><div className="space-y-8 max-w-4xl mx-auto">
    <div><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Payment Details</h1><p className="text-mutedBlue text-sm">Your payment and coupon status.</p></div>
    {loading && <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card text-mutedBlue">Loading payment...</div>}
    {error && <p role="alert" className="bg-white border border-red-500/30 rounded-2xl p-5 text-red-500 text-sm">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary">Sign in again</Link>}</p>}
    {order && <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-5 text-sm text-primary">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><p><span className="text-mutedBlue">Reference</span><br/><strong className="font-mono break-all">{order.reference || order.id}</strong></p><p><span className="text-mutedBlue">Provider</span><br/><strong>{order.provider}</strong></p><p><span className="text-mutedBlue">Order amount</span><br/><strong>{order.total_amount} {order.currency}</strong></p><p><span className="text-mutedBlue">Paid amount</span><br/><strong>{order.paid_amount ? `${order.paid_amount} ${order.paid_currency}` : 'Not verified'}</strong></p></div>
      <div className="flex flex-wrap gap-2">{[['Payment',order.payment_status],['Coupons',order.issuance_status],['Remedy',order.remedy_status]].map(([label,status]) => <span key={label} className="bg-lightBlue border border-borderBlue rounded-xl px-3 py-2 text-xs font-semibold">{label}: {status.replaceAll('_',' ')}</span>)}</div>
      <p role="status" className="bg-lightBlue rounded-xl p-4 text-mutedBlue">{next}</p>
      <div className="flex flex-wrap gap-4"><Link href="/dashboard/payments" className="text-secondary font-bold">← My Payments</Link>{order.issuance_status === 'issued' && <Link href="/dashboard/coupons" className="text-secondary font-bold">My Coupons</Link>}</div>
    </div>}
  </div></DashboardLayout>;
}
