'use client';

import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function SessionExpiredPage() {
  return (
    <AuthLayout
      title="Session Expired"
      description="Your login session has expired for security reasons."
      bgImage="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center text-warning mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Your Session Expired</h2>
          <p className="text-mutedBlue text-xs mt-1 leading-relaxed">
            For your security, we&apos;ve signed you out due to inactivity.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/sign-in"
            className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            Sign In Again
          </Link>
          <p className="text-xs text-mutedBlue">
            Need help? <Link href="#support" className="text-secondary font-bold hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
