'use client';

import React, { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

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

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
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
            <select className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors">
              <option>Select your country</option>
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Ghana</option>
            </select>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input type="checkbox" id="terms" className="mt-0.5 rounded border-borderBlue text-secondary focus:ring-secondary" />
            <label htmlFor="terms" className="text-xs text-mutedBlue leading-tight">
              I agree to the <Link href="/legal/terms" className="text-secondary font-semibold hover:underline">Terms & Conditions</Link> and <Link href="/legal/privacy" className="text-secondary font-semibold hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
          >
            Create Account
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-borderBlue"></div>
          <span className="flex-shrink mx-4 text-mutedBlue text-xs">Or continue with</span>
          <div className="flex-grow border-t border-borderBlue"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-borderBlue bg-lightBlue hover:bg-white text-primary text-xs font-semibold transition-colors shadow-sm">
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-borderBlue bg-lightBlue hover:bg-white text-primary text-xs font-semibold transition-colors shadow-sm">
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
