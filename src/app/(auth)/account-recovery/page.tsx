'use client';

import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { Lock, Phone, Headphones, ChevronRight } from 'lucide-react';

export default function AccountRecoveryPage() {
  return (
    <AuthLayout
      title="Account Recovery"
      description="Having trouble accessing your account? We can help you get back in."
      bgImage="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Recover Your Account</h2>
          <p className="text-mutedBlue text-xs mt-1">Choose a recovery option below.</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="flex items-center justify-between p-4 bg-lightBlue border border-borderBlue rounded-xl hover:border-secondary transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-primary font-bold text-sm">Reset Password</h4>
                <p className="text-mutedBlue text-xs">Use your email address.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-mutedBlue group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="#phone"
            className="flex items-center justify-between p-4 bg-lightBlue border border-borderBlue rounded-xl hover:border-secondary transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-primary font-bold text-sm">Recover with Phone</h4>
                <p className="text-mutedBlue text-xs">Use your phone number.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-mutedBlue group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="#support"
            className="flex items-center justify-between p-4 bg-lightBlue border border-borderBlue rounded-xl hover:border-secondary transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-primary font-bold text-sm">Contact Support</h4>
                <p className="text-mutedBlue text-xs">Get help from our team.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-mutedBlue group-hover:text-primary transition-colors" />
          </Link>
        </div>

        <div className="text-center pt-2">
          <Link href="/sign-in" className="text-secondary font-bold text-xs hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
