'use client';
import {Suspense,useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import {Trophy,ArrowRight} from 'lucide-react';
import {orderRequest} from '@/lib/orders';
type Win={winner_id:string;campaign_name:string;claim_id:string|null};
function PrizeClaimInstructionsContent(){
 const winnerId=useSearchParams().get('winner');const [win,setWin]=useState<Win|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 useEffect(()=>{orderRequest<Win[]>('/claims/mine').then(rows=>{const found=rows.find(r=>r.winner_id===winnerId);if(!found)throw new Error('Published win not found.');setWin(found)}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[winnerId]);
 const steps=[{num:'1',title:'Review your published win',desc:'Confirm the campaign and winning entry in My Wins.'},{num:'2',title:'Submit your claim',desc:'Provide the available contact details. Current requirements are shown in the form.'},{num:'3',title:'Claim review',desc:'The review team may ask for more information before making a decision.'},{num:'4',title:'Fulfillment record',desc:'Approval and delivery are separate states. Fulfillment is complete only after evidence is recorded.'}];
 return <DashboardLayout><div className="space-y-8 max-w-3xl mx-auto"><div className="text-center space-y-2"><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Prize Claim Instructions</h1><p className="text-mutedBlue text-sm">Review the current claim process for your published win.</p></div>
 {loading&&<p className="text-mutedBlue text-sm">Loading your win...</p>}{error&&<p role="alert" className="text-red-500 text-xs font-semibold">{error}</p>}
 {win&&<><div className="bg-success/10 border border-success/30 rounded-2xl p-6 sm:p-8 text-center space-y-3"><div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto shadow"><Trophy className="w-6 h-6"/></div><h3 className="text-xl font-extrabold text-primary">Published win: {win.campaign_name}</h3><p className="text-mutedBlue text-xs">Your claim status is recorded separately from prize delivery.</p></div><div className="space-y-4">{steps.map(s=><div key={s.num} className="bg-white border border-borderBlue rounded-2xl p-6 shadow-sm flex items-center gap-5"><div className="w-12 h-12 rounded-full bg-primary text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow">{s.num}</div><div className="flex-1"><h4 className="text-primary font-bold text-base mb-1">{s.title}</h4><p className="text-mutedBlue text-xs leading-relaxed">{s.desc}</p></div></div>)}</div><div className="pt-4 text-center"><Link href={win.claim_id?`/dashboard/draws/claim-status?claim=${win.claim_id}`:`/dashboard/draws/claim-form?winner=${win.winner_id}`} className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold px-8 py-4 rounded-pill shadow-lg transition-transform transform hover:scale-105 text-sm">{win.claim_id?'View Claim Status':'Start Claim Process'}<ArrowRight className="w-4 h-4"/></Link></div></>}
 </div></DashboardLayout>;
}
export default function PrizeClaimInstructionsPage(){return <Suspense fallback={<DashboardLayout><p className="text-mutedBlue text-sm">Loading your win...</p></DashboardLayout>}><PrizeClaimInstructionsContent/></Suspense>}
