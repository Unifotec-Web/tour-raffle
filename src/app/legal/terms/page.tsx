import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      description="Your participation in Tour Raffle is subject to the following terms and conditions."
      breadcrumb="Terms & Conditions"
      bgImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
    >
      <div className="space-y-6 text-textBlue text-sm leading-relaxed">
        <div>
          <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-2">Terms & Conditions</h3>
          <p className="text-mutedBlue text-xs">Last updated: October 12, 2025</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary text-base">1. Acceptance of Terms</h4>
          <p>
            By accessing and using Tour Raffle, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website or participate in our offers.
          </p>

          <h4 className="font-bold text-primary text-base">2. Eligibility</h4>
          <p>
            You must be at least 18 years old to participate. By entering, you confirm that you meet the eligibility requirements in your country and are legally able to enter into this agreement.
          </p>

          <h4 className="font-bold text-primary text-base">3. How It Works</h4>
          <p>
            Tour Raffle offers the opportunity to win dream travel destinations through a unique code system. You can purchase coupons, register your entries, and participate in safe, verified draws.
          </p>

          <h4 className="font-bold text-primary text-base">4. Purchases and Payments</h4>
          <p>
            All purchases are final and non-refundable, except as outlined in our Refund Policy. All transactions are processed securely through trusted payment providers.
          </p>

          <h4 className="font-bold text-primary text-base">5. Draws and Winners</h4>
          <p>
            Draws are conducted fairly and transparently. Winners are selected using a verified random process and will be notified through the contact information provided.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
