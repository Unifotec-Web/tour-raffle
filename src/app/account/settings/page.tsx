'use client';

import React from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import { HelpCircle } from 'lucide-react';

export default function AccountSettingsPage() {
  return (
    <AccountLayout
      title="Account Settings"
      description="Manage your account settings and preferences."
      breadcrumb="Account Settings"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-primary tracking-tight">Account Settings</h3>
          <p className="text-mutedBlue text-xs mt-0.5">Manage your account settings and preferences.</p>
        </div>

        <div className="divide-y divide-borderBlue space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-mutedBlue text-xs block mb-0.5">Email Address</span>
              <span className="text-primary font-bold text-sm">john@example.com</span>
              <span className="ml-2 inline-flex items-center text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Verified</span>
            </div>
            <button className="px-4 py-2 rounded-xl border border-borderBlue bg-lightBlue text-primary text-xs font-semibold hover:bg-white transition-colors">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-mutedBlue text-xs block mb-0.5">Phone Number</span>
              <span className="text-primary font-bold text-sm">+1 234 567 8900</span>
              <span className="ml-2 inline-flex items-center text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Verified</span>
            </div>
            <button className="px-4 py-2 rounded-xl border border-borderBlue bg-lightBlue text-primary text-xs font-semibold hover:bg-white transition-colors">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-mutedBlue text-xs block mb-0.5">Country</span>
              <span className="text-primary font-bold text-sm">United States</span>
            </div>
            <button className="px-4 py-2 rounded-xl border border-borderBlue bg-lightBlue text-primary text-xs font-semibold hover:bg-white transition-colors">
              Change
            </button>
          </div>
        </div>

        {/* Need Help Banner */}
        <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 flex items-center gap-3 text-xs text-textBlue mt-6">
          <HelpCircle className="w-5 h-5 text-secondary shrink-0" />
          <span>Need help? <a href="#support" className="text-secondary font-bold hover:underline">Contact our support team</a> for assistance with your account.</span>
        </div>
      </div>
    </AccountLayout>
  );
}
