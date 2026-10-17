'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { CheckSquare, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';

export default function MyEntriesPage() {
  type Entry = { id: string; entry_code: string; coupon_code: string; campaign_name: string; status: string; entry_date: string };
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  useEffect(() => {
    fetch('/api/v1/users/me/entries', { credentials: 'include' })
      .then(async response => { if (response.status === 401) throw new Error('Your session has expired. Please sign in again.'); if (!response.ok) throw new Error('Unable to load entries.'); return response.json(); })
      .then(setEntries).catch(failure => setError(failure.message)).finally(() => setLoading(false));
  }, []);
  const counts = { confirmed: entries.filter(e => e.status === 'confirmed').length, pending: entries.filter(e => e.status === 'pending').length, invalid: entries.filter(e => e.status === 'invalid').length };
  const visible = useMemo(() => entries.filter(e => (filter === 'all' || e.status === filter) && `${e.entry_code} ${e.coupon_code}`.toLowerCase().includes(search.toLowerCase())), [entries, filter, search]);

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Entry Management</h1>
            <p className="text-mutedBlue text-sm">Manage your raffle entries. Verify codes, track status and view entry history.</p>
          </div>
          <Link
            href="/dashboard/entries/register"
            className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm"
          >
            Register New Entry
          </Link>
        </div>

        {/* 4 Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Total Entries</span>
              <span className="text-2xl font-extrabold text-primary">{loading || error ? '—' : entries.length}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Confirmed Entries</span>
              <span className="text-2xl font-extrabold text-success">{loading || error ? '—' : counts.confirmed}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Pending Review</span>
              <span className="text-2xl font-extrabold text-warning">{loading || error ? '—' : counts.pending}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center text-warning">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Invalid Entries</span>
              <span className="text-2xl font-extrabold text-red-500">{loading || error ? '—' : counts.invalid}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
          {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary hover:underline">Sign in again</Link>}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'confirmed', 'pending', 'invalid'] as const).map(status => <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${filter === status ? 'bg-primary text-white font-bold shadow-sm' : 'bg-lightBlue text-primary hover:bg-borderBlue'}`}>{status[0].toUpperCase() + status.slice(1)} ({loading || error ? '—' : status === 'all' ? entries.length : counts[status]})</button>)}
            </div>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search by code or reference..."
                className="bg-lightBlue border border-borderBlue rounded-xl py-2 pl-4 pr-10 text-xs text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-mutedBlue" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderBlue text-mutedBlue font-semibold">
                  <th className="pb-3 px-4">Entry Code</th>
                  <th className="pb-3 px-4">Coupon Code</th>
                  <th className="pb-3 px-4">Campaign</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Entry Date</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {loading && <tr><td colSpan={6} className="py-8 px-4 text-center text-mutedBlue">Loading entries...</td></tr>}
                {!loading && !error && visible.length === 0 && <tr><td colSpan={6} className="py-8 px-4 text-center text-mutedBlue">No entries found.</td></tr>}
                {visible.map(e => (
                  <tr key={e.id} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{e.entry_code}</td>
                    <td className="py-3.5 px-4 font-mono text-mutedBlue">{e.coupon_code}</td>
                    <td className="py-3.5 px-4">{e.campaign_name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        e.status === 'confirmed' ? 'bg-success/15 text-success border border-success/30' :
                        e.status === 'pending' ? 'bg-warning/15 text-warning border border-warning/30' :
                        'bg-red-500/15 text-red-500 border border-red-500/30'
                      }`}>
                        {e.status[0].toUpperCase() + e.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedBlue">{new Date(e.entry_date).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/entries/register?code=${encodeURIComponent(e.coupon_code)}`}
                        className="inline-block px-3 py-1.5 rounded-lg border border-borderBlue bg-lightBlue text-primary text-[11px] font-semibold hover:bg-white transition-colors shadow-sm"
                      >
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
    </DashboardLayout>
  );
}
