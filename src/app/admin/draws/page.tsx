'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { campaignError } from '@/lib/admin-campaigns';
type Draw = { status: string; snapshot_hash: string; eligible_entries: number; eligible_participants: number };
type Campaign = { campaign_id: string; campaign_name: string; entry_count: number; winner_count: number; draw: Draw | null };
export default function AdminDrawsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const refresh = async () => { const response = await fetch('/api/v1/admin/draws', { credentials: 'include' }); if (!response.ok) throw new Error(await campaignError(response)); setCampaigns(await response.json()); };
  useEffect(() => { refresh().catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const act = async (id: string, action: string) => {
    setBusy(id); setError(''); setMessage('');
    try { const response = await fetch(`/api/v1/admin/draws/${id}/${action}`, { method: 'POST', credentials: 'include' }); if (!response.ok) throw new Error(await campaignError(response)); await refresh(); setMessage(`Draw ${action} completed.`); }
    catch (e) { setError(e instanceof Error ? e.message : 'Draw request failed.'); }
    finally { setBusy(''); }
  };
  return <AdminLayout><div className="space-y-8">
    <div><h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Draw Management</h1><p className="text-mutedBlue text-sm">Prepare, approve, execute, and publish closed campaign draws.</p></div>
    <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
      {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary hover:underline">Sign in again</Link>}</p>}
      {message && <p role="status" className="text-success text-xs font-semibold">{message}</p>}
      {loading && <p className="text-mutedBlue text-sm">Loading draws...</p>}
      {!loading && !error && campaigns.length === 0 && <p className="text-mutedBlue text-sm">No closed campaigns are ready for review.</p>}
      <div className="space-y-4">{campaigns.map(c => <div key={c.campaign_id} className="border border-borderBlue rounded-xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2"><div><h2 className="font-bold text-primary">{c.campaign_name}</h2><p className="text-mutedBlue text-xs">{c.entry_count} confirmed entries · {c.winner_count} winners</p></div><span className="text-secondary text-xs font-bold uppercase">{c.draw?.status || 'Not prepared'}</span></div>
        {c.draw && <div className="text-mutedBlue text-xs space-y-1"><p>{c.draw.eligible_participants} eligible participants · {c.draw.eligible_entries} eligible entries</p><p className="break-all">Snapshot SHA-256: <span className="font-mono">{c.draw.snapshot_hash}</span></p></div>}
        <div className="flex flex-wrap gap-2">{(!c.draw || c.draw.status === 'prepared') && <button disabled={!!busy} onClick={() => act(c.campaign_id, c.draw ? 'approve' : 'prepare')} className="bg-accent hover:bg-accent-hover text-primary font-bold px-5 py-2 rounded-pill text-xs disabled:opacity-50">{busy === c.campaign_id ? 'Working...' : c.draw ? 'Approve Snapshot' : 'Prepare Snapshot'}</button>}
        {c.draw?.status === 'approved' && <button disabled={!!busy} onClick={() => act(c.campaign_id, 'execute')} className="bg-accent hover:bg-accent-hover text-primary font-bold px-5 py-2 rounded-pill text-xs disabled:opacity-50">{busy === c.campaign_id ? 'Working...' : 'Execute Draw'}</button>}
        {c.draw?.status === 'completed' && <button disabled={!!busy} onClick={() => act(c.campaign_id, 'publish')} className="bg-accent hover:bg-accent-hover text-primary font-bold px-5 py-2 rounded-pill text-xs disabled:opacity-50">{busy === c.campaign_id ? 'Working...' : 'Publish Results'}</button>}</div>
      </div>)}</div>
    </div>
  </div></AdminLayout>;
}
