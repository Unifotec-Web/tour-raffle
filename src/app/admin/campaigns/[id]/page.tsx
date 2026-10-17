'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import CampaignForm from '@/components/admin/CampaignForm';
import { AdminCampaign, campaignError } from '@/lib/admin-campaigns';

export default function AdminCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<AdminCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch(`/api/v1/admin/campaigns/${id}`, { credentials: 'include' })
      .then(async response => { if (!response.ok) throw new Error(await campaignError(response)); return response.json(); })
      .then(setCampaign).catch(failure => setError(failure.message)).finally(() => setLoading(false));
  }, [id]);

  const transition = async (status: string) => {
    setError(''); setMessage(''); setTransitioning(true);
    try {
      const response = await fetch(`/api/v1/admin/campaigns/${id}/status`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(await campaignError(response));
      setCampaign(await response.json());
      setMessage(`Campaign is now ${status}.`);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to change campaign status.'); }
    finally { setTransitioning(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Campaign Details</h1>
          <p className="text-mutedBlue text-sm">Review campaign rules and manage registration status.</p>
        </div>
        {loading && <div className="bg-white border border-borderBlue rounded-2xl p-8 shadow-card text-mutedBlue text-sm">Loading campaign...</div>}
        {error && <p role="alert" className="bg-white border border-red-500/30 rounded-2xl p-5 text-red-500 text-sm font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary hover:underline">Sign in again</Link>}</p>}
        {!loading && !campaign && <Link href="/admin/campaigns" className="text-secondary text-sm font-bold hover:underline">← Back to Campaigns</Link>}
        {campaign && <>
          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-primary">Registration Status</h2>
                <p className="text-mutedBlue text-xs mt-1">Current status: <strong className="text-primary">{campaign.status[0].toUpperCase() + campaign.status.slice(1)}</strong> · {campaign.current_entries.toLocaleString()} / {campaign.max_capacity.toLocaleString()} entries</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.allowed_transitions.map(status => <button key={status} type="button" disabled={transitioning} onClick={() => transition(status)} className="px-4 py-2 rounded-xl bg-lightBlue border border-borderBlue text-primary text-xs font-bold hover:bg-borderBlue transition-colors disabled:opacity-60">{status[0].toUpperCase() + status.slice(1)}</button>)}
              </div>
            </div>
            {message && <p role="status" className="text-success text-xs font-semibold">{message}</p>}
            {campaign.allowed_transitions.length === 0 && <p className="text-mutedBlue text-xs">No status transition is currently available.</p>}
          </div>
          <CampaignForm campaign={campaign} onSaved={setCampaign} />
        </>}
      </div>
    </AdminLayout>
  );
}
