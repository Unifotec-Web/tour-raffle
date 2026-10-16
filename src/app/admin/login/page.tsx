'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 bg-lightBlue pt-[100px] pb-16">
        <div className="w-full max-w-md bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-accent flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">Admin Login</h1>
            <p className="text-mutedBlue text-xs">Welcome back! Please sign in to your admin account.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
              <input
                type="email"
                placeholder="enter your email address"
                className="w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="enter your password"
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

            <Link
              href="/admin"
              className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold py-3 rounded-xl shadow-md transition-colors text-sm"
            >
              Sign In
            </Link>
          </form>

          <p className="text-center text-[11px] text-mutedBlue">
            Secure admin access • Authorized personnel only
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
