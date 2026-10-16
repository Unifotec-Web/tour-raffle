'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { History, Filter } from 'lucide-react';

export default function TransactionHistoryPage() {
  const transactions = [
    { date: 'Oct 12, 2025', type: 'Coupon Purchase', desc: '2 Coupons', amount: '$30.00', status: 'Completed' },
    { date: 'Oct 10, 2025', type: 'Coupon Purchase', desc: '5 Coupons', amount: '$45.00', status: 'Completed' },
    { date: 'Oct 08, 2025', type: 'Coupon Purchase', desc: '1 Coupon', amount: '$10.00', status: 'Completed' },
    { date: 'Oct 05, 2025', type: 'Coupon Purchase', desc: '10 Coupons', amount: '$80.00', status: 'Pending' },
    { date: 'Oct 02, 2025', type: 'Coupon Purchase', desc: '2 Coupons', amount: '$20.00', status: 'Completed' },
    { date: 'Sep 28, 2025', type: 'Refund', desc: 'Payment Refund', amount: '$30.00', status: 'Completed' },
    { date: 'Sep 25, 2025', type: 'Coupon Purchase', desc: '3 Coupons', amount: '$30.00', status: 'Completed' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Transaction History</h1>
          <p className="text-mutedBlue text-sm">View all your transactions and activity.</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select className="bg-lightBlue border border-borderBlue rounded-xl py-2 px-3 text-xs text-primary font-medium focus:outline-none">
                <option>All Transactions</option>
                <option>Coupon Purchases</option>
                <option>Refunds</option>
              </select>

              <select className="bg-lightBlue border border-borderBlue rounded-xl py-2 px-3 text-xs text-primary font-medium focus:outline-none">
                <option>Oct 01, 2025 - Oct 31, 2025</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-primary text-xs font-bold shadow-sm hover:bg-accent-hover transition-colors">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderBlue text-mutedBlue font-semibold">
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Type</th>
                  <th className="pb-3 px-4">Description</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 text-mutedBlue">{t.date}</td>
                    <td className="py-3.5 px-4 font-bold text-secondary">{t.type}</td>
                    <td className="py-3.5 px-4">{t.desc}</td>
                    <td className="py-3.5 px-4 font-bold">{t.amount}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Completed' ? 'bg-success/15 text-success border border-success/30' : 'bg-warning/15 text-warning border border-warning/30'
                      }`}>
                        {t.status}
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
