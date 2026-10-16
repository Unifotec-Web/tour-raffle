'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function PrizeClaimFormPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl mx-auto">

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Prize Claim Submission</h1>
          <p className="text-mutedBlue text-sm">Complete the form below to claim your prize.</p>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-8 sm:p-10 shadow-card space-y-6">
          <div className="bg-lightBlue border border-borderBlue rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-primary text-base">Maldives Getaway (7 Days)</h4>
                <p className="text-mutedBlue text-xs">Estimated Value: $5,000</p>
              </div>
            </div>
            <span className="bg-success text-white text-xs font-bold px-3 py-1 rounded-full">Winner</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Claim submitted successfully!'); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Full Name</label>
                <input type="text" defaultValue="John Doe" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
                <input type="email" defaultValue="john.doe@example.com" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Phone Number</label>
                <input type="text" defaultValue="+1 234 567 8900" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Date of Birth</label>
                <input type="text" defaultValue="Jan 15, 1990" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">Preferred Month of Travel</label>
              <select className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none">
                <option>Select Month</option>
                <option>November 2025</option>
                <option>December 2025</option>
                <option>January 2026</option>
              </select>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input type="checkbox" id="claim-terms" className="mt-0.5 rounded border-borderBlue text-secondary focus:ring-secondary" />
              <label htmlFor="claim-terms" className="text-xs text-mutedBlue leading-tight">
                I agree to the <Link href="/legal/terms" className="text-secondary font-semibold hover:underline">Terms & Conditions</Link> and Prize Claim Agreement.
              </label>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="submit" className="flex-1 bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm">
                Submit Claim
              </button>
              <Link href="/dashboard" className="px-6 py-3.5 rounded-xl border border-borderBlue bg-white text-primary font-semibold text-sm hover:bg-lightBlue transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}
