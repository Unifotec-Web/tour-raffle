'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { orderRequest } from '@/lib/orders';
type Win = { winner_id:string; campaign_name:string; campaign_id:string; rank:number; entry_code:string; published_at:string; claim_id:string|null; claim_status:string };
export default function OfficialDrawResultsPage() {
  const [results,setResults]=useState<Win[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  useEffect(()=>{orderRequest<Win[]>('/claims/mine').then(setResults).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
  return <DashboardLayout><div className="space-y-8">
    <div><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">My Wins</h1><p className="text-mutedBlue text-sm">Your results from published raffle draws.</p></div>
    <div className="bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
      {error&&<p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired')&&<Link href="/sign-in" className="text-secondary hover:underline">Sign in again</Link>}</p>}
      {loading&&<p className="text-mutedBlue text-sm">Loading wins...</p>}
      {!loading&&!error&&results.length===0&&<p className="text-mutedBlue text-sm">No published winning results for your entries yet.</p>}
      {results.length>0&&<div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-borderBlue text-mutedBlue font-semibold"><th className="pb-3 px-4">Campaign</th><th className="pb-3 px-4">Winning Code</th><th className="pb-3 px-4">Rank</th><th className="pb-3 px-4">Claim</th><th className="pb-3 px-4">Published</th></tr></thead><tbody className="divide-y divide-borderBlue text-primary font-medium">{results.map(r=><tr key={r.winner_id}><td className="py-3.5 px-4 font-bold"><Trophy className="w-4 h-4 inline text-accent mr-2"/>{r.campaign_name}</td><td className="py-3.5 px-4 font-mono text-secondary">{r.entry_code}</td><td className="py-3.5 px-4">{r.rank}</td><td className="py-3.5 px-4">{r.claim_id?<Link href={`/dashboard/draws/claim-status?claim=${r.claim_id}`} className="text-secondary font-bold">{r.claim_status.replaceAll('_',' ')}</Link>:<Link href={`/dashboard/draws/prize-claim?winner=${r.winner_id}`} className="text-secondary font-bold">Start claim</Link>}</td><td className="py-3.5 px-4">{new Date(r.published_at+'Z').toLocaleDateString()}</td></tr>)}</tbody></table></div>}
    </div>
  </div></DashboardLayout>;
}
