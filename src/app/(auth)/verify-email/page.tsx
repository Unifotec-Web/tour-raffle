'use client';

import React, { useEffect, useState } from 'react';
import { authRequest } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { Check, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const confirm = () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
      if (!token) return;
      window.history.replaceState(null, '', window.location.pathname);
      authRequest('verification/confirm', {token}).then(() => { sessionStorage.setItem('email_verified_recently', '1'); router.replace('/verification-complete'); }).catch((error) => setMessage(error instanceof Error ? error.message : 'Link is invalid or expired.'));
    };
    confirm();
    window.addEventListener('hashchange', confirm);
    return () => window.removeEventListener('hashchange', confirm);
  }, [router]);
  async function resend() {
    if (!email) { setMessage('Enter your email address.'); return; }
    setPending(true); setMessage('');
    try { await authRequest('verification/request', {email}); setMessage('If the account is eligible, a link will be sent.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Please try again.'); }
    finally { setPending(false); }
  }
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
          <p className="text-mutedBlue text-xs mt-1">Enter your email to request or resend a verification link:</p>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email address" placeholder="Email address" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary mt-2" />
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
            <span>Click &quot;Send Verification Email&quot; if needed</span>
          </div>
        </div>

        <button
          onClick={resend} disabled={pending}
          className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
        >
          {pending ? 'Sending…' : 'Send Verification Email'}
        </button>

        {message && <p role="status" className="text-xs text-secondary">{message}</p>}
        <div className="text-center pt-1">
          <Link href="/sign-in" className="text-secondary font-bold text-xs hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
