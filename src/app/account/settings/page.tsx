'use client';

import React, { useEffect, useState } from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
import type { AuthUser } from '@/lib/auth';

export default function AccountSettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/v1/users/me', { credentials: 'include' }).then(async response => {
      if (!response.ok) throw new Error(response.status === 401 ? 'Session expired. Sign in again.' : 'Unable to load account.');
      setUser(await response.json());
    }).catch(err => setError(err.message));
  }, []);
  return (
    <AccountLayout title="Account Settings" description="Manage your account settings and preferences." breadcrumb="Account Settings">
      <div className="space-y-6">
        <div><h3 className="text-xl font-extrabold text-primary tracking-tight">Account Settings</h3><p className="text-mutedBlue text-xs mt-0.5">Manage your account settings and preferences.</p></div>
        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        {!user && !error && <p role="status" className="text-xs text-mutedBlue">Loading account…</p>}
        {user && <div className="divide-y divide-borderBlue space-y-4">
          <div className="flex items-center justify-between py-3"><div><span className="text-mutedBlue text-xs block mb-0.5">Email Address</span><span className="text-primary font-bold text-sm">{user.email}</span><span className={`ml-2 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${user.is_verified ? 'text-success bg-success/10' : 'text-secondary bg-lightBlue'}`}>{user.is_verified ? 'Verified' : 'Unverified'}</span></div>{!user.is_verified && <Link href="/verify-email" className="px-4 py-2 rounded-xl border border-borderBlue bg-lightBlue text-primary text-xs font-semibold hover:bg-white transition-colors">Verify</Link>}</div>
          <div className="flex items-center justify-between py-3"><div><span className="text-mutedBlue text-xs block mb-0.5">Country</span><span className="text-primary font-bold text-sm">{user.country}</span></div></div>
        </div>}
        <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 flex items-center gap-3 text-xs text-textBlue mt-6"><HelpCircle className="w-5 h-5 text-secondary shrink-0" /><span>Need help? <Link href="/support/contact" className="text-secondary font-bold hover:underline">Contact our support team</Link> for assistance with your account.</span></div>
      </div>
    </AccountLayout>
  );
}
