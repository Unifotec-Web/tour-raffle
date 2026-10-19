'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Ticket, ShieldCheck, RefreshCw, XCircle, Search } from 'lucide-react';

export default function MyCouponsPage() {
  type Coupon = { id: string; code: string; campaign_name: string; status: string; purchase_date: string; valid_until: string; remedy_status?: string | null };
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  useEffect(() => {
    fetch('/api/v1/users/me/coupons', { credentials: 'include' })
      .then(async response => { if (response.status === 401) throw new Error('Your session has expired. Please sign in again.'); if (!response.ok) throw new Error('Unable to load coupons.'); return response.json(); })
      .then(setCoupons).catch(failure => setError(failure.message)).finally(() => setLoading(false));
  }, []);
  const effectiveStatus = (c: Coupon) => { const status = c.status === 'active' ? 'unused' : c.status === 'redeemed' ? 'registered' : c.status; return status === 'unused' && new Date(c.valid_until) <= new Date() ? 'expired' : status; };
  const counts = { unused: coupons.filter(c => effectiveStatus(c) === 'unused').length, registered: coupons.filter(c => effectiveStatus(c) === 'registered').length, expired: coupons.filter(c => effectiveStatus(c) === 'expired').length, refunded: coupons.filter(c => effectiveStatus(c) === 'refunded').length };
  const visible = useMemo(() => coupons.filter(c => (filter === 'all' || effectiveStatus(c) === filter) && c.code.toLowerCase().includes(search.toLowerCase())), [coupons, filter, search]);

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Coupon Management</h1>
            <p className="text-mutedBlue text-sm">Manage your purchased raffle coupons. Track their status and view details.</p>
          </div>
          <Link
            href="/dashboard/coupons/purchase"
            className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm"
          >
            Buy More Coupons
          </Link>
        </div>

        {/* 4 Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Total Coupons</span>
              <span className="text-2xl font-extrabold text-primary">{loading || error ? '—' : coupons.length}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
              <Ticket className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Unused Coupons</span>
              <span className="text-2xl font-extrabold text-success">{loading || error ? '—' : counts.unused}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Registered Coupons</span>
              <span className="text-2xl font-extrabold text-secondary">{loading || error ? '—' : counts.registered}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Expired Coupons</span>
              <span className="text-2xl font-extrabold text-red-500">{loading || error ? '—' : counts.expired}</span>
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
              {(['all', 'unused', 'registered', 'expired', 'refunded'] as const).map(status => <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${filter === status ? 'bg-primary text-white font-bold shadow-sm' : 'bg-lightBlue text-primary hover:bg-borderBlue'}`}>{status[0].toUpperCase() + status.slice(1)} ({loading || error ? '—' : status === 'all' ? coupons.length : counts[status]})</button>)}
            </div>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search coupon code..."
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
                  <th className="pb-3 px-4">Coupon Code</th>
                  <th className="pb-3 px-4">Purchase Date</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Valid Until</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {loading && <tr><td colSpan={5} className="py-8 px-4 text-center text-mutedBlue">Loading coupons...</td></tr>}
                {!loading && !error && visible.length === 0 && <tr><td colSpan={5} className="py-8 px-4 text-center text-mutedBlue">No coupons found.</td></tr>}
                {visible.map(c => (
                  <tr key={c.id} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{c.code}</td>
                    <td className="py-3.5 px-4 text-mutedBlue">{new Date(c.purchase_date).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        effectiveStatus(c) === 'unused' ? 'bg-success/15 text-success border border-success/30' :
                        effectiveStatus(c) === 'registered' ? 'bg-secondary/15 text-secondary border border-secondary/30' :
                        'bg-red-500/15 text-red-500 border border-red-500/30'
                      }`}>
                        {effectiveStatus(c)[0].toUpperCase() + effectiveStatus(c).slice(1)}{c.remedy_status === 'pending_review' ? ' · Review pending' : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedBlue">{new Date(c.valid_until).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/entries/register?code=${encodeURIComponent(c.code)}`}
                        className="inline-block px-3 py-1.5 rounded-lg border border-borderBlue bg-lightBlue text-primary text-[11px] font-semibold hover:bg-white transition-colors shadow-sm"
                      >
                        {effectiveStatus(c) === 'unused' ? 'Register Entry' : 'View Details'}
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
