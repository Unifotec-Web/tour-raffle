import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Download, CreditCard } from 'lucide-react';

export default function PaymentReceiptsPage() {
  const receipts = [
    { date: 'Oct 12, 2025', ref: '9A783C20', desc: '2 Coupons Purchase', amount: '$30.00' },
    { date: 'Oct 10, 2025', ref: '8F4D1E6A', desc: '5 Coupons Purchase', amount: '$45.00' },
    { date: 'Oct 08, 2025', ref: '7C3E9B2F', desc: '1 Coupon Purchase', amount: '$10.00' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Payment Receipts</h1>
          <p className="text-mutedBlue text-sm">Download and view your payment receipts.</p>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderBlue text-mutedBlue font-semibold">
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Reference</th>
                  <th className="pb-3 px-4">Description</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {receipts.map((r, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 text-mutedBlue">{r.date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{r.ref}</td>
                    <td className="py-3.5 px-4">{r.desc}</td>
                    <td className="py-3.5 px-4 font-bold">{r.amount}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderBlue bg-lightBlue text-primary text-[11px] font-semibold hover:bg-white transition-colors">
                        <Download className="w-3.5 h-3.5 text-secondary" /> Download
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
