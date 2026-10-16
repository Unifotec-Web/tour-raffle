import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="We value your privacy and are committed to protecting your personal information."
      breadcrumb="Privacy Policy"
      bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
    >
      <div className="space-y-6 text-textBlue text-sm leading-relaxed">
        <div>
          <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-2">Privacy Policy</h3>
          <p className="text-mutedBlue text-xs">Last updated: October 12, 2025</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary text-base">1. Information We Collect</h4>
          <p>
            We collect personal information you provide to us, including your name, email address, phone number, payment information, and country of residence.
          </p>

          <h4 className="font-bold text-primary text-base">2. How We Use Your Information</h4>
          <p>
            We use your information to process entries and payments, notify you about raffle draws and winners, improve our services, and send important updates.
          </p>

          <h4 className="font-bold text-primary text-base">3. Information Sharing</h4>
          <p>
            We do not sell or rent your personal information to third parties. We may share data with trusted payment processors and compliance partners as required by law.
          </p>

          <h4 className="font-bold text-primary text-base">4. Data Security</h4>
          <p>
            We employ industry-standard security measures to safeguard your personal data against unauthorized access, disclosure, or alteration.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
