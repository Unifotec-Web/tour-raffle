'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Order, orderRequest } from '@/lib/orders';

type Remedy = { id: string; reason: string; status: string; decision: string | null };
type Detail = Order & { owner_email: string; coupon_count: number; remedies: Remedy[] };
export default function AdminPaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const [order,setOrder] = useState<Detail | null>(null);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const refresh = useCallback(async()=>setOrder(await orderRequest<Detail>(`/admin/orders/${id}`)),[id]);
  useEffect(()=>{ refresh().catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[refresh]);
  const action = async (kind:'reconcile'|'recover') => { setError('');setMessage('');setBusy(true);try { const result = await orderRequest<Order & {provider_status?:string}>(`/admin/orders/${id}/${kind}`,{method:'POST'});await refresh();setMessage(kind==='reconcile' ? `Provider status: ${result.provider_status?.replaceAll('_',' ') || 'unknown'}. Order: ${result.status.replaceAll('_',' ')}.` : `Issuance status: ${result.issuance_status.replaceAll('_',' ')}.`); } catch(e) {setError(e instanceof Error?e.message:'Action failed.');} finally {setBusy(false);} };
  return <AdminLayout><div className="space-y-8 max-w-4xl mx-auto"><div><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Payment Details</h1><p className="text-mutedBlue text-sm">Review provider and issuance state before taking action.</p></div>
    {loading && <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card text-mutedBlue">Loading order...</div>}
    {error && <p role="alert" className="bg-white border border-red-500/30 rounded-2xl p-5 text-red-500 text-sm">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary">Sign in again</Link>}</p>}
    {order && <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-5 text-sm text-primary"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><p><span className="text-mutedBlue">Owner</span><br/><strong>{order.owner_email}</strong></p><p><span className="text-mutedBlue">Reference</span><br/><strong className="font-mono break-all">{order.reference || 'Checkout not started'}</strong></p><p><span className="text-mutedBlue">Order amount</span><br/><strong>{order.total_amount} {order.currency}</strong></p><p><span className="text-mutedBlue">Verified amount</span><br/><strong>{order.paid_amount ? `${order.paid_amount} ${order.paid_currency}` : 'Not verified'}</strong></p></div><div className="flex flex-wrap gap-2">{[['Payment',order.payment_status],['Issuance',order.issuance_status],['Remedy',order.remedy_status]].map(([label,status])=><span key={label} className="bg-lightBlue border border-borderBlue rounded-xl px-3 py-2 text-xs font-semibold">{label}: {status.replaceAll('_',' ')}</span>)}</div><p className="text-mutedBlue">{order.coupon_count} coupon{order.coupon_count===1?'':'s'} issued · {order.quantity} ordered</p><div className="flex flex-wrap gap-2"><button disabled={busy || !order.reference} onClick={()=>action('reconcile')} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-50">Query provider & reconcile</button><button disabled={busy || order.issuance_status!=='pending'} onClick={()=>action('recover')} className="px-4 py-2 rounded-xl bg-lightBlue border border-borderBlue text-primary text-xs font-bold disabled:opacity-50">Recover issuance</button></div>{message && <p role="status" className="text-success text-xs font-semibold">{message}</p>}{order.remedies.length>0 && <div><h2 className="font-bold text-primary mb-2">Remedies</h2>{order.remedies.map(r=><Link key={r.id} href={`/admin/payments/remedies/${r.id}`} className="block text-secondary py-1">{r.reason.replaceAll('_',' ')} · {r.status.replaceAll('_',' ')}</Link>)}</div>}</div>}
    <Link href="/admin/payments" className="text-secondary text-sm font-bold">← Payments</Link>
  </div></AdminLayout>;
}
