'use client';

import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function VerificationCompletePage() {
  return (
    <AuthLayout
      title="Email Verified!"
      description="Your email address has been successfully verified. You can now access all features."
      bgImage="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Verification Complete</h2>
          <p className="text-success font-semibold text-sm mt-1">Your email is verified!</p>
        </div>

        <div className="space-y-3 pt-4">
          <Link
            href="/account/settings"
            className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            Continue to Dashboard
          </Link>
          <Link
            href="/"
            className="block text-secondary font-bold text-xs hover:underline"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
