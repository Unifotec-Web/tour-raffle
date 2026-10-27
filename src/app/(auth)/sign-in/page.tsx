'use client';

import React, { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authRequest } from '@/lib/auth';
import { announceSessionChange } from '@/lib/session';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const fields = new FormData(event.currentTarget);
    try {
      const user = await authRequest('login', { email: fields.get('email'), password: fields.get('password') });
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      if (isAdmin) {
        const check = await fetch('/api/v1/admin/me', { credentials: 'include', cache: 'no-store' });
        if (!check.ok) throw new Error('Admin access could not be verified. Please sign in again.');
      }
      announceSessionChange();
      router.replace(isAdmin ? '/admin/campaigns' : '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your account and continue your journey."
      bgImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Sign In to Your Account</h2>
          <p className="text-mutedBlue text-xs mt-1">Enter your details to access your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email address"
              className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="Enter your password"
                className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-3 text-mutedBlue hover:text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-borderBlue text-secondary focus:ring-secondary" />
              <label htmlFor="remember" className="text-mutedBlue">Remember me</label>
            </div>
            <Link href="/forgot-password" className="text-secondary font-semibold hover:underline">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            {pending ? 'Signing In…' : 'Sign In'}
          </button>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-borderBlue"></div>
          <span className="flex-shrink mx-4 text-mutedBlue text-xs">Or continue with</span>
          <div className="flex-grow border-t border-borderBlue"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" disabled title="Social sign-in is not available yet" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-borderBlue bg-lightBlue hover:bg-white text-primary text-xs font-semibold transition-colors shadow-sm">
            Google
          </button>
          <button type="button" disabled title="Social sign-in is not available yet" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-borderBlue bg-lightBlue hover:bg-white text-primary text-xs font-semibold transition-colors shadow-sm">
            Facebook
          </button>
        </div>

        <p className="text-center text-xs text-mutedBlue">
          Don&apos;t have an account? <Link href="/sign-up" className="text-secondary font-bold hover:underline">Sign Up</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
