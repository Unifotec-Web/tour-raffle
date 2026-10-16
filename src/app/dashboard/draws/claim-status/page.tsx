import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { CheckCircle2, Clock, Trophy } from 'lucide-react';

export default function PrizeClaimStatusPage() {
  const steps = [
    { title: 'Claim Submitted', desc: 'Oct 15, 2025 10:34 AM', status: 'Completed' },
    { title: 'Identity Verification', desc: 'Oct 15, 2025 02:17 PM', status: 'Completed' },
    { title: 'Travel Details Confirmation', desc: 'Pending review by our support team', status: 'Pending' },
    { title: 'Voucher Issuance', desc: 'Pending travel confirmation', status: 'Pending' },
    { title: 'Travel Date', desc: 'Scheduled upon confirmation', status: 'Pending' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl mx-auto">

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Prize Claim Status</h1>
          <p className="text-mutedBlue text-sm">Track the progress of your prize claim.</p>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-8 sm:p-10 shadow-card space-y-6">
          <div className="bg-lightBlue border border-borderBlue rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-primary text-base">Maldives Getaway (7 Days)</h4>
                <p className="text-mutedBlue text-xs">Winning Code: TRF-7XSK-D82P-8Q6L • Claim Submitted: Oct 15, 2025</p>
              </div>
            </div>
            <span className="bg-warning text-primary text-xs font-bold px-3 py-1 rounded-full">In Progress</span>
          </div>

          <div className="space-y-4 pt-4">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-lightBlue/60 border border-borderBlue rounded-xl">
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.status === 'Completed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                    {s.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">{s.title}</h4>
                    <p className="text-mutedBlue text-xs">{s.desc}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${s.status === 'Completed' ? 'text-success' : 'text-warning'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 text-center">
            <Link href="/dashboard" className="text-secondary font-bold text-xs hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
