'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Trophy, CheckCircle2, Download } from 'lucide-react';

export default function OfficialDrawResultsPage() {
  const winners = [
    { code: 'TRF-7X9K-382P-8Q6L', prize: 'Maldives Getaway', status: 'Verified' },
    { code: 'TRF-4Q10-776R-32K9', prize: '$5,000 Cash', status: 'Verified' },
    { code: 'TRF-9L2M-61DC-804F', prize: 'Maldives Getaway', status: 'Verified' },
    { code: 'TRF-0NBP-907T-IVJ1', prize: '$3,000 Cash', status: 'Verified' },
    { code: 'TRF-2K4D-771M-SQBH', prize: 'Maldives Getaway', status: 'Verified' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Official Draw Results</h1>
            <p className="text-mutedBlue text-sm">Here are the verified results from our latest raffle draw.</p>
          </div>
          <button className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-colors text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Full Results
          </button>
        </div>

        {/* Campaign Banner Card */}
        <div className="bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-primary">Maldives Dream Getaway</h3>
              <p className="text-mutedBlue text-xs mt-0.5">Draw Date: Oct 12, 2025 • Draw ID: TR-2020-001</p>
            </div>
            <span className="bg-success/15 text-success border border-success/30 font-bold text-xs px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-borderBlue text-center">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Total Coupons</span>
              <span className="text-xl font-extrabold text-primary">125,432</span>
            </div>
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Total Entries</span>
              <span className="text-xl font-extrabold text-primary">324,568</span>
            </div>
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Winners</span>
              <span className="text-xl font-extrabold text-primary">450</span>
            </div>
          </div>

          {/* Winners Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderBlue text-mutedBlue font-semibold">
                  <th className="pb-3 px-4">#</th>
                  <th className="pb-3 px-4">Winning Code</th>
                  <th className="pb-3 px-4">Prize</th>
                  <th className="pb-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {winners.map((w, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 text-mutedBlue font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{w.code}</td>
                    <td className="py-3.5 px-4 font-bold">{w.prize}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/30">
                        {w.status}
                      </span>
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
