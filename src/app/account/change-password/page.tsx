'use client';

import React, { useState } from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import { Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordPage() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  return (
    <AccountLayout
      title="Change Password"
      description="Keep your account secure with a strong password."
      breadcrumb="Change Password"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-primary tracking-tight">Change Password</h3>
          <p className="text-mutedBlue text-xs mt-0.5">Keep your account secure with a strong password.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Current Password</label>
            <div className="relative">
              <input
                type={show1 ? 'text' : 'password'}
                placeholder="Enter your current password"
                className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow1(!show1)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-3 text-mutedBlue hover:text-primary"
              >
                {show1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">New Password</label>
            <div className="relative">
              <input
                type={show2 ? 'text' : 'password'}
                placeholder="Create a new password"
                className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow2(!show2)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-3 text-mutedBlue hover:text-primary"
              >
                {show2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={show3 ? 'text' : 'password'}
                placeholder="Confirm your new password"
                className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow3(!show3)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-3 text-mutedBlue hover:text-primary"
              >
                {show3 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm mt-4"
          >
            Update Password
          </button>
        </form>
      </div>
    </AccountLayout>
  );
}
