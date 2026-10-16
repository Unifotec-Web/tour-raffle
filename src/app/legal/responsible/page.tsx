import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export default function ResponsiblePage() {
  return (
    <LegalLayout
      title="Responsible Participation"
      description="We promote responsible and safe participation for all our users."
      breadcrumb="Responsible Participation"
      bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
    >
      <div className="space-y-6 text-textBlue text-sm leading-relaxed">
        <div>
          <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-2">Responsible Participation</h3>
          <p className="text-mutedBlue text-xs">Last updated: October 12, 2025</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary text-base">1. Play Responsibly</h4>
          <p>
            Raffles should be a fun and exciting experience. We encourage all participants to play responsibly and within their means.
          </p>

          <h4 className="font-bold text-primary text-base">2. Set a Budget</h4>
          <p>
            Only spend what you can afford, do not use money intended for essential expenses, and avoid chasing losses.
          </p>

          <h4 className="font-bold text-primary text-base">3. Seek Help</h4>
          <p>
            If you feel that your participation is becoming a problem, please reach out for support. You are not alone.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
