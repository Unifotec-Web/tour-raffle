import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export default function AgreementPage() {
  return (
    <LegalLayout
      title="Participant Agreement"
      description="By participating in Tour Raffle, you agree to the following terms."
      breadcrumb="Participant Agreement"
      bgImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
    >
      <div className="space-y-6 text-textBlue text-sm leading-relaxed">
        <div>
          <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-2">Participant Agreement</h3>
          <p className="text-mutedBlue text-xs">Last updated: October 12, 2025</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary text-base">1. Your Responsibilities</h4>
          <p>
            Provide accurate and truthful information, follow all platform rules and guidelines, and use the platform in a lawful and respectful manner.
          </p>

          <h4 className="font-bold text-primary text-base">2. Prohibited Activities</h4>
          <p>
            Fraudulent or multiple accounts, manipulating the raffle system, and violating any applicable laws are strictly prohibited.
          </p>

          <h4 className="font-bold text-primary text-base">3. Limitation of Liability</h4>
          <p>
            Tour Raffle is not liable for any indirect, incidental, or consequential damages resulting from your participation in our raffles.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
