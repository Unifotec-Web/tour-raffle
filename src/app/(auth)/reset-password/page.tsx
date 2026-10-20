'use client';

import React, { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { authRequest } from '@/lib/auth';

export default function ResetPasswordPage() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const values = new FormData(event.currentTarget);
    if (values.get('password') !== values.get('confirm')) { setMessage('Passwords do not match.'); return; }
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!token) { setMessage('This reset link is missing or invalid.'); return; }
    setPending(true); setMessage('');
    try { await authRequest('password/reset', {token, password: values.get('password')}); setDone(true); window.history.replaceState(null, '', window.location.pathname); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to reset password.'); }
    finally { setPending(false); }
  }

  return (
    <AuthLayout
      title="Create a New Password"
      description="Choose a strong password to keep your account secure."
      bgImage="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Reset Your Password</h2>
          <p className="text-mutedBlue text-xs mt-1">Please enter your new password below.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">New Password</label>
            <div className="relative">
              <input
                type={show1 ? 'text' : 'password'} name="password" required minLength={12}
                placeholder="Create a strong password"
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
            <label className="block text-xs font-bold text-primary mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={show2 ? 'text' : 'password'} name="confirm" required minLength={12}
                placeholder="Confirm your password"
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

          <button
            type="submit" disabled={pending || done}
            className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            {pending ? 'Resetting…' : done ? 'Password Reset' : 'Reset Password'}
          </button>
          {message && <p role="alert" className="text-xs text-secondary">{message}</p>}
          {done && <p role="status" className="text-xs text-success">Password reset. Sign in with your new password.</p>}
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
