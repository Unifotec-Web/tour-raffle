'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Order, orderRequest } from '@/lib/orders';

type AdminOrder = Order & { owner_email: string };
type Page = { items: AdminOrder[]; total: number; limit: number; offset: number };
export default function AdminPayments() {
  const [result, setResult] = useState<Page | null>(null);
  const [payment, setPayment] = useState('');
  const [issuance, setIssuance] = useState('');
  const [remedy, setRemedy] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { const params = new URLSearchParams({ limit:'20', offset:String(offset) }); if(payment) params.set('payment_status',payment); if(issuance) params.set('issuance_status',issuance); if(remedy) params.set('remedy_status',remedy); setLoading(true); setError(''); setResult(null); orderRequest<Page>(`/admin/orders?${params}`).then(setResult).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[payment,issuance,remedy,offset]);
  const selectClass = 'bg-lightBlue border border-borderBlue rounded-xl px-3 py-2 text-xs text-primary';
  return <AdminLayout><div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Payments</h1><p className="text-mutedBlue text-sm">Review orders, provider payments, coupon issuance, and remedies.</p></div><Link href="/admin/payments/remedies" className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md text-sm">Remedy Queue</Link></div>
    <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
      <div className="flex flex-wrap gap-2"><label className="text-xs text-mutedBlue">Payment<br/><select aria-label="Payment status" className={selectClass} value={payment} onChange={e=>{setPayment(e.target.value);setOffset(0)}}><option value="">All</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option></select></label><label className="text-xs text-mutedBlue">Issuance<br/><select aria-label="Issuance status" className={selectClass} value={issuance} onChange={e=>{setIssuance(e.target.value);setOffset(0)}}><option value="">All</option><option value="not_started">Not started</option><option value="pending">Pending</option><option value="issued">Issued</option><option value="review_required">Review required</option></select></label><label className="text-xs text-mutedBlue">Remedy<br/><select aria-label="Remedy status" className={selectClass} value={remedy} onChange={e=>{setRemedy(e.target.value);setOffset(0)}}><option value="">All</option><option value="none">None</option><option value="review_required">Review required</option><option value="under_review">Under review</option></select></label></div>
      {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary">Sign in again</Link>}</p>}
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-borderBlue text-mutedBlue font-semibold">{['Date','Owner','Amount','Payment','Issuance','Remedy','Actions'].map(h=><th key={h} className="pb-3 px-4">{h}</th>)}</tr></thead><tbody className="divide-y divide-borderBlue text-primary font-medium">{loading && <tr><td colSpan={7} className="py-8 text-center text-mutedBlue">Loading orders...</td></tr>}{!loading && !error && !result?.items.length && <tr><td colSpan={7} className="py-8 text-center text-mutedBlue">No orders found.</td></tr>}{result?.items.map(o=><tr key={o.id} className="hover:bg-lightBlue/40"><td className="py-3.5 px-4">{new Date(o.created_at).toLocaleDateString()}</td><td className="py-3.5 px-4">{o.owner_email}</td><td className="py-3.5 px-4">{o.total_amount} {o.currency}</td><td className="py-3.5 px-4">{o.payment_status}</td><td className="py-3.5 px-4">{o.issuance_status}</td><td className="py-3.5 px-4">{o.remedy_status}</td><td className="py-3.5 px-4"><Link href={`/admin/payments/${o.id}`} className="text-secondary font-bold">View</Link></td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between text-xs text-mutedBlue"><span>{result?.total ?? 0} orders</span><div className="flex gap-2"><button disabled={offset===0} onClick={()=>setOffset(Math.max(0,offset-20))} className="px-3 py-2 rounded-xl border border-borderBlue disabled:opacity-40">Previous</button><button disabled={!result || offset+20>=result.total} onClick={()=>setOffset(offset+20)} className="px-3 py-2 rounded-xl border border-borderBlue disabled:opacity-40">Next</button></div></div>
    </div>
  </div></AdminLayout>;
}
