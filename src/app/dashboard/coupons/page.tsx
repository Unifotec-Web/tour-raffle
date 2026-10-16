'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Ticket, ShieldCheck, RefreshCw, XCircle, Search } from 'lucide-react';

export default function MyCouponsPage() {
  const coupons = [
    { code: 'TRF-7X9K-382P-8Q6L', date: 'Oct 12, 2025 10:34 AM', status: 'Active', validUntil: 'Nov 11, 2025' },
    { code: 'TRF-3D4F-918Z-7K2M', date: 'Oct 10, 2025 02:17 PM', status: 'Active', validUntil: 'Nov 9, 2025' },
    { code: 'TRF-681K-2Q9V-4L7C', date: 'Oct 8, 2025 11:45 AM', status: 'Redeemed', validUntil: '-' },
    { code: 'TRF-9X80-1V6Z-3P7T', date: 'Oct 5, 2025 04:22 PM', status: 'Expired', validUntil: 'Oct 4, 2025' },
    { code: 'TRF-2NAQ-6J5P-9H3L', date: 'Oct 2, 2025 09:12 AM', status: 'Active', validUntil: 'Nov 1, 2025' },
  ];

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
              <span className="text-2xl font-extrabold text-primary">12</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
              <Ticket className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Active Coupons</span>
              <span className="text-2xl font-extrabold text-success">10</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Redeemed Coupons</span>
              <span className="text-2xl font-extrabold text-secondary">1</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Expired Coupons</span>
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
              <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm">All (12)</button>
              <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Active (10)</button>
              <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Redeemed (1)</button>
              <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Expired (1)</button>
            </div>
            <div className="relative">
              <input
                type="text"
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
                {coupons.map((c, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{c.code}</td>
                    <td className="py-3.5 px-4 text-mutedBlue">{c.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-success/15 text-success border border-success/30' :
                        c.status === 'Redeemed' ? 'bg-secondary/15 text-secondary border border-secondary/30' :
                        'bg-red-500/15 text-red-500 border border-red-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedBlue">{c.validUntil}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/dashboard/entries/register"
                        className="inline-block px-3 py-1.5 rounded-lg border border-borderBlue bg-lightBlue text-primary text-[11px] font-semibold hover:bg-white transition-colors shadow-sm"
                      >
                        View Details
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
