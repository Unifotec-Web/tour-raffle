'use client';

import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { Check, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify Your Email"
      description="We've sent a verification link to your email address."
      bgImage="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6 text-center">
        <div className="w-14 h-14 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary mx-auto shadow-sm">
          <Mail className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Check Your Email</h2>
          <p className="text-mutedBlue text-xs mt-1">We sent a verification link to:</p>
          <p className="text-primary font-bold text-sm mt-0.5">john@example.com</p>
        </div>

        <div className="bg-lightBlue rounded-xl p-4 text-left space-y-2 text-xs text-textBlue border border-borderBlue">
          <p className="font-bold text-primary mb-1">Didn&apos;t receive the email?</p>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success shrink-0" />
            <span>Check your spam folder</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success shrink-0" />
            <span>Make sure you entered the correct email</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success shrink-0" />
            <span>Click &quot;Resend Email&quot; if needed</span>
          </div>
        </div>

        <button
          onClick={() => {}}
          className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
        >
          Resend Email
        </button>

        <div className="text-center pt-1">
          <Link href="/sign-in" className="text-secondary font-bold text-xs hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
