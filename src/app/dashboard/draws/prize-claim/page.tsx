import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';

export default function PrizeClaimInstructionsPage() {
  const steps = [
    { num: '1', title: 'Verify Your Identity', desc: 'Complete the identity verification process with your government-issued ID.' },
    { num: '2', title: 'Complete the Claim Form', desc: 'Fill out the prize claim form with your travel preferences and contact details.' },
    { num: '3', title: 'Confirm Travel Details', desc: 'Our team will contact you to confirm your travel dates and preferences.' },
    { num: '4', title: 'Receive Your Voucher', desc: 'You\'ll get your travel voucher and detailed itinerary via email within 5-7 business days.' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl mx-auto">

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Prize Claim Instructions</h1>
          <p className="text-mutedBlue text-sm">Follow these steps to claim your prize. It&apos;s simple and secure!</p>
        </div>

        {/* Congratulations Banner */}
        <div className="bg-success/10 border border-success/30 rounded-2xl p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto shadow">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-primary">Congratulations! You&apos;ve Won a Maldives Getaway!</h3>
          <p className="text-mutedBlue text-xs">Follow the steps below to claim your prize and start your dream vacation.</p>
        </div>

        {/* 4 Steps */}
        <div className="space-y-4">
          {steps.map((s, idx) => (
            <div key={idx} className="bg-white border border-borderBlue rounded-2xl p-6 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow">
                {s.num}
              </div>
              <div className="flex-1">
                <h4 className="text-primary font-bold text-base mb-1">{s.title}</h4>
                <p className="text-mutedBlue text-xs leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/dashboard/draws/claim-form"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold px-8 py-4 rounded-pill shadow-lg transition-transform transform hover:scale-105 text-sm"
          >
            Start Claim Process
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}
