'use client';

import React from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import { Camera } from 'lucide-react';

export default function EditProfilePage() {
  return (
    <AccountLayout
      title="Edit Profile"
      description="Update your personal information and profile details."
      breadcrumb="Edit Profile"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-primary tracking-tight">Edit Profile</h3>
          <p className="text-mutedBlue text-xs mt-0.5">Update your personal information and profile details.</p>
        </div>

        {/* Profile Photo Upload */}
        <div className="flex items-center gap-4 py-2">
          <div className="w-16 h-16 rounded-full bg-lightBlue border-2 border-borderBlue flex items-center justify-center text-secondary relative overflow-hidden shadow-sm">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <button className="px-4 py-2 rounded-xl border border-borderBlue bg-lightBlue text-primary text-xs font-semibold hover:bg-white transition-colors flex items-center gap-2 shadow-sm">
              <Camera className="w-3.5 h-3.5" /> Change Photo
            </button>
            <p className="text-[10px] text-mutedBlue mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 pt-2">
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
              defaultValue="john@example.com"
              className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">Country</label>
            <select className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell us a little about yourself..."
              className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm mt-4"
          >
            Save Changes
          </button>
        </form>
      </div>
    </AccountLayout>
  );
}
