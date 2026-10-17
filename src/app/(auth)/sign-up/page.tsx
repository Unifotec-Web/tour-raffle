'use client';

import React, { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authRequest } from '@/lib/auth';

export default function SignUpPage() {
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
      await authRequest('register', {
        full_name: fields.get('full_name'), email: fields.get('email'),
        password: fields.get('password'), country: fields.get('country'),
        accept_terms: fields.get('terms') === 'on',
      });
      router.push('/sign-in?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account creation failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Your Next Big Win"
      highlight="Starts Here"
      description="Join thousands of dreamers and get closer to your dream vacation!"
      bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Create Your Account</h2>
          <p className="text-mutedBlue text-xs mt-1">Join Tour Raffle and start your journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              required
              placeholder="Enter your full name"
              className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

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
                minLength={12}
                required
                placeholder="Create a strong password"
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

          <div>
            <label className="block text-xs font-bold text-primary mb-1">Country</label>
            <select name="country" required defaultValue="" className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors">
              <option value="" disabled>Select your country</option>
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Ghana</option>
            </select>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input type="checkbox" id="terms" name="terms" required className="mt-0.5 rounded border-borderBlue text-secondary focus:ring-secondary" />
            <label htmlFor="terms" className="text-xs text-mutedBlue leading-tight">
              I agree to the <Link href="/legal/terms" className="text-secondary font-semibold hover:underline">Terms & Conditions</Link> and <Link href="/legal/privacy" className="text-secondary font-semibold hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            {pending ? 'Creating Account…' : 'Create Account'}
          </button>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-borderBlue"></div>
          <span className="flex-shrink mx-4 text-mutedBlue text-xs">Or continue with</span>
          <div className="flex-grow border-t border-borderBlue"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" disabled title="Social sign-up is not available yet" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-borderBlue bg-lightBlue hover:bg-white text-primary text-xs font-semibold transition-colors shadow-sm">
            Google
          </button>
          <button type="button" disabled title="Social sign-up is not available yet" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-borderBlue bg-lightBlue hover:bg-white text-primary text-xs font-semibold transition-colors shadow-sm">
            Facebook
          </button>
        </div>

        <p className="text-center text-xs text-mutedBlue">
          Already have an account? <Link href="/sign-in" className="text-secondary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
