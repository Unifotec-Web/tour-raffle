'use client';

import React, { useEffect, useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function VerificationCompletePage() {
  const [verified, setVerified] = useState(false);
  useEffect(() => { setVerified(sessionStorage.getItem('email_verified_recently') === '1'); sessionStorage.removeItem('email_verified_recently'); }, []);
  return (
    <AuthLayout
      title={verified ? "Email Verified!" : "Email Verification"}
      description={verified ? "Your email address has been verified." : "Open your email verification link to complete this step."}
      bgImage="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">{verified ? 'Verification Complete' : 'Verification Pending'}</h2>
          <p className="text-success font-semibold text-sm mt-1">{verified ? 'Your email is verified.' : 'Use the link sent to your email.'}</p>
        </div>

        <div className="space-y-3 pt-4">
          <Link
            href="/account/settings"
            className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            Continue to Account
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
