'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Ticket } from 'lucide-react';

export default function CouponGenerationPage() {
  const [quantity, setQuantity] = useState('5000');
  const [campaign, setCampaign] = useState('Maldives Dream Getaway');

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Coupon Generation</h1>
          <p className="text-mutedBlue text-sm">Generate unique raffle codes for your campaigns.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-4">
            <h3 className="text-xl font-extrabold text-primary">Generate Parameters</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Campaign</label>
                <select
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none"
                >
                  <option>Maldives Dream Getaway</option>
                  <option>Bali Adventure</option>
                  <option>Dubai Luxury Trip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none"
                />
                <span className="text-[11px] text-mutedBlue mt-1 block">Min: 1, Max: 100,000</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Code Format</label>
                <select className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none">
                  <option>Auto (e.g. TR-1234XYZAB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Prefix (Optional)</label>
                <input type="text" placeholder="Enter prefix" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none" />
              </div>

              <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 text-xs space-y-1">
                <span className="text-mutedBlue block">Preview:</span>
                <strong className="text-primary font-mono text-sm">TR-73564A1B</strong>
              </div>
            </div>

            <button onClick={() => alert('Coupons generated successfully!')} className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm mt-4">
              Generate Coupons
            </button>
          </div>

          <div className="lg:col-span-5 bg-lightBlue border border-borderBlue rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-lg font-bold text-primary">Generation Summary</h3>
            <div className="space-y-3 text-xs text-textBlue">
              <div className="flex justify-between pb-2 border-b border-borderBlue"><span className="text-mutedBlue">Campaign:</span><strong className="text-primary">{campaign}</strong></div>
              <div className="flex justify-between pb-2 border-b border-borderBlue"><span className="text-mutedBlue">Quantity:</span><strong className="text-primary">{quantity}</strong></div>
              <div className="flex justify-between pb-2 border-b border-borderBlue"><span className="text-mutedBlue">Code Format:</span><strong className="text-primary">Auto</strong></div>
              <div className="flex justify-between pb-2 border-b border-borderBlue"><span className="text-mutedBlue">Prefix:</span><strong className="text-primary">TR-</strong></div>
            </div>
            <p className="text-[11px] text-mutedBlue pt-2">
              ℹ️ This will generate unique coupon codes securely associated with the selected campaign.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
