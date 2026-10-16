'use client';

import React, { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export default function ProcessingPaymentPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard/coupons/purchase'); // or success
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-xl mx-auto text-center py-12">
        <div className="bg-white border border-borderBlue rounded-2xl p-10 shadow-card space-y-6">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto" />

          <div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">Processing your payment...</h1>
            <p className="text-mutedBlue text-xs mt-1">Please do not close this window. This may take a few moments.</p>
          </div>

          <div className="space-y-3 text-left text-xs pt-4 max-w-xs mx-auto text-textBlue">
            <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-success" /> Verifying payment details</div>
            <div className="flex items-center gap-3"><Loader2 className="w-4 h-4 text-secondary animate-spin" /> Processing with payment provider</div>
            <div className="flex items-center gap-3 text-mutedBlue"><Circle className="w-4 h-4 text-borderBlue" /> Confirming transaction</div>
            <div className="flex items-center gap-3 text-mutedBlue"><Circle className="w-4 h-4 text-borderBlue" /> Issuing your coupons</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
