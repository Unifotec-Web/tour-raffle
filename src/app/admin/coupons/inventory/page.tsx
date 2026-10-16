import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search } from 'lucide-react';

export default function AdminCouponInventoryPage() {
  const coupons = [
    { code: 'TRF-7F3DT9428', campaign: 'Maldives Dream Getaway', status: 'Active', created: 'Oct 10, 2025' },
    { code: 'TRF-A5BL3Q7Z', campaign: 'Bali Adventure', status: 'Active', created: 'Oct 10, 2025' },
    { code: 'TRF-6X2PU5MTY', campaign: 'Dubai Luxury Trip', status: 'Used', created: 'Oct 9, 2025' },
    { code: 'TRF-6B6D21T8K', campaign: 'Seychelles Escape', status: 'Active', created: 'Oct 8, 2025' },
    { code: 'TRF-2NJ1LV4P', campaign: 'European Tour', status: 'Reserved', created: 'Oct 7, 2025' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Coupon Management</h1>
          <p className="text-mutedBlue text-sm">View and manage all generated coupon codes.</p>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select className="bg-lightBlue border border-borderBlue rounded-xl py-2 px-3 text-xs text-primary font-medium focus:outline-none">
                <option>All Campaigns</option>
                <option>Maldives Dream Getaway</option>
              </select>
              <select className="bg-lightBlue border border-borderBlue rounded-xl py-2 px-3 text-xs text-primary font-medium focus:outline-none">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Used</option>
              </select>
            </div>
            <div className="relative">
              <input type="text" placeholder="Search coupon code..." className="bg-lightBlue border border-borderBlue rounded-xl py-2 pl-4 pr-10 text-xs text-primary placeholder-mutedBlue focus:outline-none" />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-mutedBlue" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderBlue text-mutedBlue font-semibold">
                  <th className="pb-3 px-4">Code</th>
                  <th className="pb-3 px-4">Campaign</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Created Date</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderBlue text-primary font-medium">
                {coupons.map((c, idx) => (
                  <tr key={idx} className="hover:bg-lightBlue/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">{c.code}</td>
                    <td className="py-3.5 px-4">{c.campaign}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active' ? 'bg-success/15 text-success border border-success/30' :
                        c.status === 'Used' ? 'bg-secondary/15 text-secondary border border-secondary/30' :
                        'bg-warning/15 text-warning border border-warning/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-mutedBlue">{c.created}</td>
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
