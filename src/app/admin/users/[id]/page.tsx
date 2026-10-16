import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { User, Mail, Phone, Globe, Shield } from 'lucide-react';

export default function AdminUserDetailsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">User Details</h1>
          <p className="text-mutedBlue text-sm">View detailed information about a user.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-4 bg-white border border-borderBlue rounded-2xl p-6 shadow-card text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-lightBlue border-2 border-borderBlue flex items-center justify-center text-secondary mx-auto overflow-hidden shadow-sm">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="John Doe" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-primary">John Doe</h3>
              <p className="text-mutedBlue text-xs">john@example.com</p>
            </div>
            <div className="flex justify-center gap-2">
              <span className="bg-success/15 text-success font-bold text-[10px] px-2.5 py-0.5 rounded-full">Active</span>
              <span className="bg-secondary/15 text-secondary font-bold text-[10px] px-2.5 py-0.5 rounded-full">Member</span>
            </div>
            <div className="pt-4 border-t border-borderBlue text-xs text-left space-y-2 text-mutedBlue">
              <div>Joined: <strong className="text-primary">Oct 1, 2025</strong></div>
              <div>Total Spent: <strong className="text-primary">$240.00</strong></div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6">
            <div className="flex border-b border-borderBlue gap-6 text-sm font-bold">
              <span className="pb-3 border-b-2 border-secondary text-secondary">Overview</span>
              <span className="pb-3 border-b-2 border-transparent text-mutedBlue">Activity</span>
              <span className="pb-3 border-b-2 border-transparent text-mutedBlue">Transactions</span>
              <span className="pb-3 border-b-2 border-transparent text-mutedBlue">Entries</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-textBlue">
              <div><span className="text-mutedBlue block">Full Name</span><strong className="text-primary text-sm">John Doe</strong></div>
              <div><span className="text-mutedBlue block">Email</span><strong className="text-primary text-sm">john@example.com</strong></div>
              <div><span className="text-mutedBlue block">Phone</span><strong className="text-primary text-sm">+1 (234) 567-8900</strong></div>
              <div><span className="text-mutedBlue block">Country</span><strong className="text-primary text-sm">United States</strong></div>
            </div>

            <div className="pt-4 border-t border-borderBlue flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-xl bg-accent text-primary font-bold text-xs shadow-sm">Edit User</button>
              <button className="px-4 py-2 rounded-xl bg-lightBlue border border-borderBlue text-primary font-semibold text-xs">Change Role</button>
              <button className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-semibold text-xs">Suspend</button>
              <button className="px-4 py-2 rounded-xl bg-lightBlue border border-borderBlue text-primary font-semibold text-xs">Reset Password</button>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
