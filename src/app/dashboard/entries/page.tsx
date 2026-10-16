'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { CheckSquare, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';

export default function MyEntriesPage() {
  const entries = [
    { entryCode: 'ENT-9F20-4B6Q', coupon: 'TRF-7X9K-382P-8Q6L', campaign: 'The Ultimate Getaway', status: 'Confirmed', date: 'Oct 12, 2025 10:45 AM' },
    { entryCode: 'ENT-3KTL-1Q9P', coupon: 'TRF-3D4F-918Z-7K2M', campaign: 'The Ultimate Getaway', status: 'Confirmed', date: 'Oct 11, 2025 06:32 PM' },
    { entryCode: 'ENT-8P6V-2M4T', coupon: 'TRF-681K-2Q9V-4L7C', campaign: 'The Ultimate Getaway', status: 'Pending', date: 'Oct 11, 2025 02:21 PM' },
    { entryCode: 'ENT-5D3Q-7V8L', coupon: 'TRF-9X80-1V6Z-3P7T', campaign: 'The Ultimate Getaway', status: 'Confirmed', date: 'Oct 10, 2025 11:12 AM' },
    { entryCode: 'ENT-1VDK-6TJP', coupon: 'TRF-2NAQ-6J5P-9H3L', campaign: 'The Ultimate Getaway', status: 'Invalid', date: 'Oct 9, 2025 04:45 PM' },
  ];

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
              <span className="text-2xl font-extrabold text-primary">48</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Confirmed Entries</span>
              <span className="text-2xl font-extrabold text-success">45</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Pending Review</span>
              <span className="text-2xl font-extrabold text-warning">2</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center text-warning">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Invalid Entries</span>
              <span className="text-2xl font-extrabold text-red-500">1</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm">All (48)</button>
              <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Confirmed (45)</button>
              <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Pending (2)</button>
              <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Invalid (1)</button>
            </div>
            <div className="relative">
              <input
                type="text"
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
                {entries.map((e, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{e.entryCode}</td>
                    <td className="py-3.5 px-4 font-mono text-mutedBlue">{e.coupon}</td>
                    <td className="py-3.5 px-4">{e.campaign}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        e.status === 'Confirmed' ? 'bg-success/15 text-success border border-success/30' :
                        e.status === 'Pending' ? 'bg-warning/15 text-warning border border-warning/30' :
                        'bg-red-500/15 text-red-500 border border-red-500/30'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedBlue">{e.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/dashboard/entries/register"
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
