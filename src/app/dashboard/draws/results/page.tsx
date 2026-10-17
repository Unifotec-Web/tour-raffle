'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { campaignError } from '@/lib/admin-campaigns';
type Result = { campaign_name: string; campaign_id: string; rank: number; entry_code: string; published_at: string };
export default function OfficialDrawResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/v1/draws/mine', { credentials: 'include' }).then(async r => { if (!r.ok) throw new Error(await campaignError(r)); return r.json(); }).then(setResults).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <DashboardLayout><div className="space-y-8">
    <div><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Official Draw Results</h1><p className="text-mutedBlue text-sm">Your results from published raffle draws.</p></div>
    <div className="bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
      {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary hover:underline">Sign in again</Link>}</p>}
      {loading && <p className="text-mutedBlue text-sm">Loading results...</p>}
      {!loading && !error && results.length === 0 && <p className="text-mutedBlue text-sm">No published winning results for your entries yet.</p>}
      {results.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-borderBlue text-mutedBlue font-semibold"><th className="pb-3 px-4">Campaign</th><th className="pb-3 px-4">Winning Code</th><th className="pb-3 px-4">Rank</th><th className="pb-3 px-4">Published</th></tr></thead><tbody className="divide-y divide-borderBlue text-primary font-medium">{results.map(r => <tr key={`${r.campaign_id}-${r.entry_code}`}><td className="py-3.5 px-4 font-bold"><Trophy className="w-4 h-4 inline text-accent mr-2" />{r.campaign_name}</td><td className="py-3.5 px-4 font-mono text-secondary">{r.entry_code}</td><td className="py-3.5 px-4">{r.rank}</td><td className="py-3.5 px-4">{new Date(r.published_at + 'Z').toLocaleDateString()}</td></tr>)}</tbody></table></div>}
    </div>
  </div></DashboardLayout>;
}
