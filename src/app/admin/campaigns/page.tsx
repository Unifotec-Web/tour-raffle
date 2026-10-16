import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';

export default function AdminCampaignsPage() {
  const campaigns = [
    { name: 'Maldives Dream Getaway', prize: '$135,432', status: 'Active', start: 'Oct 10, 2025', end: 'Dec 31, 2025' },
    { name: 'Bali Adventure', prize: '$85,000', status: 'Active', start: 'Nov 1, 2025', end: 'Jan 31, 2026' },
    { name: 'Dubai Luxury Trip', prize: '$75,000', status: 'Scheduled', start: 'Dec 1, 2025', end: 'Feb 28, 2026' },
    { name: 'Seychelles Escape', prize: '$60,000', status: 'Draft', start: 'Nov 15, 2025', end: 'Mar 31, 2026' },
    { name: 'European Tour', prize: '$88,000', status: 'Completed', start: 'Aug 1, 2025', end: 'Sep 30, 2025' },
  ];

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
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <input type="text" placeholder="Search campaigns..." className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2 pl-4 pr-10 text-xs text-primary placeholder-mutedBlue focus:outline-none" />
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
                {campaigns.map((c, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold">{c.name}</td>
                    <td className="py-3.5 px-4">{c.prize}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-success/15 text-success border border-success/30' :
                        c.status === 'Scheduled' ? 'bg-warning/15 text-warning border border-warning/30' :
                        c.status === 'Completed' ? 'bg-secondary/15 text-secondary border border-secondary/30' :
                        'bg-red-500/15 text-red-500 border border-red-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedBlue">{c.start}</td>
                    <td className="py-3.5 px-4 text-mutedBlue">{c.end}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="px-3 py-1.5 rounded-lg border border-borderBlue bg-lightBlue text-primary text-[11px] font-semibold hover:bg-white transition-colors">
                        View
                      </button>
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
