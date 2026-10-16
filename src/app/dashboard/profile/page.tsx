'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Camera } from 'lucide-react';

export default function DashboardProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Profile Settings</h1>
            <p className="text-mutedBlue text-sm">Manage your account information and preferences.</p>
          </div>
          <button className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm">
            Save Changes
          </button>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6">
          <h3 className="text-xl font-extrabold text-primary tracking-tight">Personal Information</h3>

          <div className="flex items-center gap-4 py-2 border-b border-borderBlue pb-6">
            <div className="w-16 h-16 rounded-full bg-lightBlue border-2 border-borderBlue flex items-center justify-center text-secondary relative overflow-hidden shadow-sm">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <button className="px-4 py-2 rounded-xl border border-borderBlue bg-lightBlue text-primary text-xs font-semibold hover:bg-white transition-colors flex items-center gap-2 shadow-sm">
                <Camera className="w-3.5 h-3.5" /> Change Photo
              </button>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">Phone Number</label>
                <input
                  type="text"
                  defaultValue="+1 234 567 8900"
                  className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Date of Birth</label>
                <input
                  type="text"
                  defaultValue="Jan 15, 1990"
                  className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}
