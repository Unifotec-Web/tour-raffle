import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Headphones, Plus } from 'lucide-react';

export default function SupportTicketsPage() {
  const tickets = [
    { id: '#ST-4587', subject: 'Payment issue', category: 'Payments', status: 'In Progress', created: 'Oct 08, 2025' },
    { id: '#ST-4210', subject: 'Entry not showing', category: 'Technical', status: 'Open', created: 'Oct 05, 2025' },
    { id: '#ST-3987', subject: 'Coupon purchase help', category: 'General', status: 'Resolved', created: 'Sep 30, 2025' },
    { id: '#ST-3765', subject: 'Refund request', category: 'Refunds', status: 'Closed', created: 'Sep 25, 2025' },
    { id: '#ST-3421', subject: 'Account verification', category: 'Account', status: 'Resolved', created: 'Sep 20, 2025' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Support Tickets</h1>
            <p className="text-mutedBlue text-sm">Get help with your questions and issues.</p>
          </div>
          <button className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Ticket
          </button>
        </div>

        {/* Tickets Table */}
        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm">All Tickets</button>
            <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Open</button>
            <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">In Progress</button>
            <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Resolved</button>
            <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Closed</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderBlue text-mutedBlue font-semibold">
                  <th className="pb-3 px-4">ID</th>
                  <th className="pb-3 px-4">Subject</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {tickets.map((t, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{t.id}</td>
                    <td className="py-3.5 px-4 font-bold">{t.subject}</td>
                    <td className="py-3.5 px-4 text-mutedBlue">{t.category}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved' ? 'bg-success/15 text-success border border-success/30' :
                        t.status === 'In Progress' ? 'bg-warning/15 text-warning border border-warning/30' :
                        t.status === 'Open' ? 'bg-secondary/15 text-secondary border border-secondary/30' :
                        'bg-mutedBlue/15 text-mutedBlue border border-mutedBlue/30'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-mutedBlue">{t.created}</td>
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
