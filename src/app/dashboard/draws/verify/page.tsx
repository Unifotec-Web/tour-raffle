'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WinningCodeVerificationPage() {
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl mx-auto">

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Winning Code Verification</h1>
          <p className="text-mutedBlue text-sm">Enter your winning code below to check if you&apos;re a winner.</p>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-8 sm:p-10 shadow-card space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if(code) setVerified(true); }} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your winning code (e.g. TRF-7X9K-382P-8Q6L)"
              className="w-full bg-lightBlue border border-borderBlue rounded-xl py-3 px-4 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary font-mono font-bold text-center"
            />
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm"
            >
              Verify Code
            </button>
          </form>

          {verified && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-left flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
              <div>
                <h4 className="font-bold text-primary text-sm">Congratulations! This code is a verified winner!</h4>
                <p className="text-mutedBlue text-xs">Proceed to prize claim instructions to claim your reward.</p>
              </div>
            </div>
          )}

          <div className="bg-lightBlue border border-borderBlue rounded-xl p-4 text-left text-xs space-y-2">
            <h4 className="font-bold text-primary">Example Codes:</h4>
            <div className="text-mutedBlue font-mono space-y-1">
              <div>TRF-7XSK-D82P-8Q6L</div>
              <div>TRF-4Q10-776R-3229</div>
              <div>TRF-9L2M-61DC-804F</div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
