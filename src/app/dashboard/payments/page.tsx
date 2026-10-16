'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { CreditCard, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';

export default function MyPaymentsPage() {
  const payments = [
    { date: 'Oct 12, 2025', ref: '9A783C20', desc: '2 Coupons Purchase', amount: '$30.00', status: 'Successful' },
    { date: 'Oct 10, 2025', ref: '8F4D1E6A', desc: '5 Coupons Purchase', amount: '$45.00', status: 'Successful' },
    { date: 'Oct 08, 2025', ref: '7C3E9B2F', desc: '1 Coupon Purchase', amount: '$10.00', status: 'Successful' },
    { date: 'Oct 05, 2025', ref: '6D0F8A7C', desc: '10 Coupons Purchase', amount: '$80.00', status: 'Pending' },
    { date: 'Oct 02, 2025', ref: '5B1C7D9E', desc: '2 Coupons Purchase', amount: '$20.00', status: 'Successful' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">My Payments</h1>
            <p className="text-mutedBlue text-sm">Manage your payments and view your payment history.</p>
          </div>
          <Link
            href="/dashboard/coupons/purchase"
            className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm"
          >
            Make a Payment
          </Link>
        </div>

        {/* 4 Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Total Spent</span>
              <span className="text-2xl font-extrabold text-primary">$120.00</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Successful Payments</span>
              <span className="text-2xl font-extrabold text-success">6</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Pending Payments</span>
              <span className="text-2xl font-extrabold text-warning">1</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center text-warning">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-mutedBlue text-xs block mb-1">Failed Payments</span>
              <span className="text-2xl font-extrabold text-red-500">0</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm">All Payments</button>
            <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Successful</button>
            <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Pending</button>
            <button className="px-4 py-2 rounded-xl bg-lightBlue text-primary text-xs font-semibold hover:bg-borderBlue transition-colors">Failed</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderBlue text-mutedBlue font-semibold">
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Reference</th>
                  <th className="pb-3 px-4">Description</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {payments.map((p, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 text-mutedBlue">{p.date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{p.ref}</td>
                    <td className="py-3.5 px-4">{p.desc}</td>
                    <td className="py-3.5 px-4 font-bold">{p.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Successful' ? 'bg-success/15 text-success border border-success/30' : 'bg-warning/15 text-warning border border-warning/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderBlue bg-lightBlue text-primary text-[11px] font-semibold hover:bg-white transition-colors shadow-sm">
                        <Download className="w-3.5 h-3.5 text-secondary" /> View
                      </button>
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
