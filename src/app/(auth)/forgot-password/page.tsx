'use client';

import React, { useState } from 'react';
import { authRequest } from '@/lib/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage('');
    try { await authRequest('password/request', {email: new FormData(event.currentTarget).get('email')}); setMessage('If the account is eligible, a reset link will be sent.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Please try again.'); }
    finally { setPending(false); }
  }
  return (
    <AuthLayout
      title="Reset Your Password"
      description="Enter your email address and we'll send you a link to reset your password."
      bgImage="https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Forgot Your Password?</h2>
          <p className="text-mutedBlue text-xs mt-1">Enter your email address and we&apos;ll send you a reset link for your password.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
            <input
              type="email" name="email" required
              placeholder="Enter your email address"
              className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <button
            type="submit" disabled={pending}
            className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            {pending ? 'Sending…' : 'Send Reset Link'}
          </button>
          {message && <p role="status" className="text-xs text-secondary">{message}</p>}
        </form>

        <div className="text-center pt-2">
          <Link href="/sign-in" className="text-secondary font-bold text-xs hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
