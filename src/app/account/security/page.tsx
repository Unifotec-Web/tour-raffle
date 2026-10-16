'use client';

import React, { useState } from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import { Shield, Lock, Laptop, Smartphone, HelpCircle, ChevronRight } from 'lucide-react';

export default function AccountSecurityPage() {
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <AccountLayout
      title="Account Security"
      description="Manage your security settings and keep your account safe."
      breadcrumb="Account Security"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-primary tracking-tight">Account Security</h3>
          <p className="text-mutedBlue text-xs mt-0.5">Manage your security settings and keep your account safe.</p>
        </div>

        <div className="space-y-4">

          {/* Item 1: 2FA */}
          <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-primary font-bold text-sm">Two-factor Authentication</h4>
                <p className="text-mutedBlue text-xs">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-borderBlue peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-borderBlue after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
            </label>
          </div>

          {/* Item 2: Login Activity */}
          <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-primary font-bold text-sm">Login Activity</h4>
                <p className="text-mutedBlue text-xs">View your recent login activity and devices.</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl border border-borderBlue bg-white text-primary text-xs font-semibold hover:bg-lightBlue transition-colors shadow-sm">
              View Activity
            </button>
          </div>

          {/* Item 3: Trusted Devices */}
          <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-primary font-bold text-sm">Trusted Devices</h4>
                <p className="text-mutedBlue text-xs">Manage devices that can access your account.</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl border border-borderBlue bg-white text-primary text-xs font-semibold hover:bg-lightBlue transition-colors shadow-sm">
              Manage Devices
            </button>
          </div>

          {/* Item 4: Security Tips */}
          <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-primary font-bold text-sm">Security Tips</h4>
                <p className="text-mutedBlue text-xs">Keep your account safe with these best practices.</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl border border-borderBlue bg-white text-primary text-xs font-semibold hover:bg-lightBlue transition-colors shadow-sm">
              View Tips
            </button>
          </div>

        </div>
      </div>
    </AccountLayout>
  );
}
