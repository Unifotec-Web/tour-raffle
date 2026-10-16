'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

export default function AdminCreateCampaignPage() {
  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Create Campaign</h1>
          <p className="text-mutedBlue text-sm">Set up a new raffle campaign or edit an existing one.</p>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6">
          <h3 className="text-xl font-extrabold text-primary">Campaign Details</h3>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Campaign Name *</label>
              <input type="text" placeholder="Enter campaign name" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">Description</label>
              <textarea rows={3} placeholder="Enter campaign description" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Prize Value *</label>
                <input type="text" placeholder="Enter prize value" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Currency</label>
                <select className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Start Date *</label>
                <input type="date" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary mb-1">End Date *</label>
                <input type="date" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none" />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="submit" className="flex-1 bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm">
                Save Campaign
              </button>
              <Link href="/admin/campaigns" className="px-6 py-3.5 rounded-xl border border-borderBlue bg-white text-primary font-semibold text-sm hover:bg-lightBlue transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
