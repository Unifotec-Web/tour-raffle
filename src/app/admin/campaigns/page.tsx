'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { AdminCampaign, campaignError } from '@/lib/admin-campaigns';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    fetch('/api/v1/admin/campaigns', { credentials: 'include' })
      .then(async response => { if (!response.ok) throw new Error(await campaignError(response)); return response.json(); })
      .then(setCampaigns).catch(failure => setError(failure.message)).finally(() => setLoading(false));
  }, []);
  const visible = useMemo(() => campaigns.filter(campaign => campaign.name.toLowerCase().includes(search.toLowerCase())), [campaigns, search]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Campaign Management</h1>
            <p className="text-mutedBlue text-sm">Create, manage and monitor all raffle campaigns.</p>
          </div>
          <Link href="/admin/campaigns/create" className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-colors text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Campaign
          </Link>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
          {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary hover:underline">Sign in again</Link>}</p>}
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <input type="text" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search campaigns..." className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2 pl-4 pr-10 text-xs text-primary placeholder-mutedBlue focus:outline-none" />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-mutedBlue" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderBlue text-mutedBlue font-semibold">
                  <th className="pb-3 px-4">Campaign Name</th>
                  <th className="pb-3 px-4">Prize</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Start Date</th>
                  <th className="pb-3 px-4">End Date</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {loading && <tr><td colSpan={6} className="py-8 px-4 text-center text-mutedBlue">Loading campaigns...</td></tr>}
                {!loading && !error && visible.length === 0 && <tr><td colSpan={6} className="py-8 px-4 text-center text-mutedBlue">No campaigns found.</td></tr>}
                {visible.map(c => (
                  <tr key={c.id} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold">{c.name}</td>
                    <td className="py-3.5 px-4">{new Intl.NumberFormat('en-US', { style: 'currency', currency: c.currency }).format(Number(c.prize_value))}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'open' ? 'bg-success/15 text-success border border-success/30' :
                        c.status === 'scheduled' ? 'bg-warning/15 text-warning border border-warning/30' :
                        c.status === 'completed' ? 'bg-secondary/15 text-secondary border border-secondary/30' :
                        'bg-red-500/15 text-red-500 border border-red-500/30'
                      }`}>
                        {c.status[0].toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedBlue">{new Date(`${c.start_date}Z`).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-mutedBlue">{new Date(`${c.end_date}Z`).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/admin/campaigns/${c.id}`} className="inline-block px-3 py-1.5 rounded-lg border border-borderBlue bg-lightBlue text-primary text-[11px] font-semibold hover:bg-white transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
