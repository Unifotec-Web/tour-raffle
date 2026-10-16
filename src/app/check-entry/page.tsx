'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, ShieldCheck, Bell, HelpCircle } from 'lucide-react';

export default function CheckEntryPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<null | 'confirmed' | 'pending' | 'invalid' | 'used'>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    // Mock status based on input or default to confirmed
    const upper = code.toUpperCase();
    if (upper.includes('PENDING')) setStatus('pending');
    else if (upper.includes('INVALID')) setStatus('invalid');
    else if (upper.includes('USED')) setStatus('used');
    else setStatus('confirmed');
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Check Your Entry"
        description="Verify your coupon code and see if you're entered in the current raffle."
        breadcrumb="Check Entry"
        bgImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Coupon Form Card */}
        <div className="bg-white border border-borderBlue rounded-2xl p-8 sm:p-10 shadow-card text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-extrabold text-primary mb-2">Enter Your Coupon Code</h3>
          <p className="text-mutedBlue text-sm mb-6">Type your unique coupon code below to check your entry status.</p>

          <form onSubmit={handleCheck} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your coupon code (e.g., TRF-7X9K-382P-8Q6L)"
                className="w-full bg-lightBlue border border-borderBlue rounded-xl py-3.5 px-4 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm"
            >
              Check Entry
            </button>
          </form>

          <p className="text-xs text-mutedBlue mt-4">
            Your code is case-insensitive. Make sure to enter the full code correctly.
          </p>

          {/* Result Alert if checked */}
          {status && (
            <div className="mt-6 p-4 rounded-xl border text-left flex items-start gap-3 animate-fadeIn bg-lightBlue border-secondary/30">
              {status === 'confirmed' && <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />}
              {status === 'pending' && <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />}
              {status === 'invalid' && <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              {status === 'used' && <AlertCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />}
              <div>
                <h4 className="font-bold text-primary text-sm capitalize">{status} Entry Status</h4>
                <p className="text-mutedBlue text-xs mt-0.5">
                  {status === 'confirmed' && 'Your coupon code is valid and you are successfully entered in the raffle!'}
                  {status === 'pending' && 'Your entry is currently being verified. This usually takes a few minutes.'}
                  {status === 'invalid' && 'The coupon code you entered is not valid. Please check and try again.'}
                  {status === 'used' && 'This coupon code has already been used and cannot be entered again.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Entry Status Examples */}
        <div>
          <h3 className="text-xl font-extrabold text-primary mb-6 tracking-tight text-center">Entry Status Examples</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Example 1 */}
            <div className="bg-success/5 border border-success/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-base mb-1">Entry Confirmed</h4>
                  <p className="text-mutedBlue text-xs leading-relaxed">Your coupon code is valid and you&apos;re successfully entered in the raffle.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-success/20 flex justify-end">
                <Link href="#details" className="text-success text-xs font-bold hover:underline flex items-center gap-1">
                  View Details →
                </Link>
              </div>
            </div>

            {/* Example 2 */}
            <div className="bg-warning/5 border border-warning/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-base mb-1">Pending Review</h4>
                  <p className="text-mutedBlue text-xs leading-relaxed">Your entry is being verified. This usually takes a few minutes.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-warning/20 flex justify-end">
                <Link href="#details" className="text-warning text-xs font-bold hover:underline flex items-center gap-1">
                  View Details →
                </Link>
              </div>
            </div>

            {/* Example 3 */}
            <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-base mb-1">Invalid Code</h4>
                  <p className="text-mutedBlue text-xs leading-relaxed">The coupon code you entered is not valid. Please check and try again.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-red-500/20 flex justify-end">
                <Link href="#try" className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1">
                  Try Again →
                </Link>
              </div>
            </div>

            {/* Example 4 */}
            <div className="bg-secondary/5 border border-secondary/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-base mb-1">Already Used</h4>
                  <p className="text-mutedBlue text-xs leading-relaxed">This coupon code has already been used and cannot be entered again.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-secondary/20 flex justify-end">
                <Link href="#entries" className="text-secondary text-xs font-bold hover:underline flex items-center gap-1">
                  View Your Entries →
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Need Help Banner */}
        <div className="relative rounded-2xl overflow-hidden py-12 px-8 bg-primary-dark text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80')` }}
          />
          <div className="relative z-15 space-y-1">
            <h3 className="text-xl font-bold">Need Help?</h3>
            <p className="text-white/80 text-xs sm:text-sm">If you&apos;re having trouble checking your entry, our support team is here to assist you.</p>
          </div>
          <Link
            href="#support"
            className="relative z-15 bg-accent hover:bg-accent-hover text-primary font-bold text-xs sm:text-sm px-6 py-3 rounded-pill shadow-md transition-all shrink-0"
          >
            Contact Support →
          </Link>
        </div>

        {/* Quick Tips */}
        <div className="bg-lightBlue border border-borderBlue rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-primary mb-4">Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-textBlue">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block mb-0.5">Double-check the code</strong>
                Make sure you&apos;ve entered the full code correctly without missing characters.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block mb-0.5">Check your notifications</strong>
                We&apos;ll also notify you via email about your entry status and updates.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block mb-0.5">Use the right format</strong>
                Codes are case-insensitive, but must follow the standard coupon formatting.
              </div>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
