'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { ShieldCheck, Bell, HelpCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterEntryPage() {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Register Your Entry</h1>
          <p className="text-mutedBlue text-sm">Enter your coupon code below to register for the raffle.</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-mutedBlue">
          <span className="flex items-center gap-1.5 text-primary"><span className="w-6 h-6 rounded-full bg-accent text-primary flex items-center justify-center">1</span> Enter Code</span>
          <span>---</span>
          <span className="flex items-center gap-1.5"><span className={`w-6 h-6 rounded-full flex items-center justify-center ${verifying ? 'bg-accent text-primary animate-pulse' : 'bg-borderBlue text-mutedBlue'}`}>2</span> Verify</span>
          <span>---</span>
          <span className="flex items-center gap-1.5"><span className={`w-6 h-6 rounded-full flex items-center justify-center ${verified ? 'bg-success text-white' : 'bg-borderBlue text-mutedBlue'}`}>3</span> Confirmed</span>
        </div>

        {!verified && !verifying ? (
          <div className="bg-white border border-borderBlue rounded-2xl p-8 sm:p-10 shadow-card space-y-6">
            <h3 className="text-xl font-extrabold text-primary tracking-tight">Coupon Code</h3>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. TRF-7X9K-382P-8Q6L"
                  className="w-full bg-lightBlue border border-borderBlue rounded-xl py-3 px-4 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-all text-sm"
              >
                Check Code
              </button>
            </form>

            {/* Quick Tips */}
            <div className="bg-lightBlue border border-borderBlue rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-primary text-sm">Quick Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-textBlue">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span><strong>Double-check the code for accuracy</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Bell className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span><strong>Make sure your coupon is valid and not expired</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span><strong>Each code can only be used once</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span><strong>You&apos;ll receive a confirmation after successful registration</strong></span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href="/dashboard/entries" className="text-secondary font-bold text-xs hover:underline">
                ← Back to Raffle Details
              </Link>
            </div>
          </div>
        ) : verifying ? (
          /* Verification in Progress State */
          <div className="bg-white border border-borderBlue rounded-2xl p-12 shadow-card text-center space-y-6">
            <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto" />
            <div>
              <h3 className="text-2xl font-extrabold text-primary tracking-tight">Checking your entry...</h3>
              <p className="text-mutedBlue text-xs mt-1">Please wait while we validate your coupon code.</p>
            </div>

            <div className="max-w-xs mx-space space-y-2 text-left text-xs text-textBlue pt-4">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Validating coupon code</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Checking campaign status</div>
              <div className="flex items-center gap-2 animate-pulse"><Loader2 className="w-4 h-4 text-secondary animate-spin" /> Verifying entry eligibility</div>
            </div>
          </div>
        ) : (
          /* Confirmed Success State */
          <div className="bg-white border border-borderBlue rounded-2xl p-10 shadow-card text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-primary tracking-tight">Entry Confirmed!</h1>
              <p className="text-mutedBlue text-xs mt-1">Your coupon code is valid and you are successfully entered in the raffle.</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/entries"
                className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-colors text-sm"
              >
                View My Entries
              </Link>
              <Link
                href="/dashboard"
                className="bg-white hover:bg-lightBlue text-primary font-semibold px-6 py-3 rounded-pill border border-borderBlue transition-colors text-sm shadow-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
