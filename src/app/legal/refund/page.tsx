import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      description="We want you to be confident when participating in our raffles."
      breadcrumb="Refund Policy"
      bgImage="https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=2000&q=80"
    >
      <div className="space-y-6 text-textBlue text-sm leading-relaxed">
        <div>
          <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-2">Refund Policy</h3>
          <p className="text-mutedBlue text-xs">Last updated: October 12, 2025</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary text-base">1. General Policy</h4>
          <p>
            All purchases are final and non-refundable, except as specified in this refund policy.
          </p>

          <h4 className="font-bold text-primary text-base">2. When Refunds Are Eligible</h4>
          <p>
            Refunds may be provided in the following circumstances: technical errors that prevent coupon participation, duplicate charges, or fraudulent transactions.
          </p>

          <h4 className="font-bold text-primary text-base">3. Refund Process</h4>
          <p>
            To request a refund, contact our support team within 7 days of the transaction with your transaction details and reason for the request.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
