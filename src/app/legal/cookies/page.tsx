import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      description="We use cookies to improve your experience on our website."
      breadcrumb="Cookie Policy"
      bgImage="https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=2000&q=80"
    >
      <div className="space-y-6 text-textBlue text-sm leading-relaxed">
        <div>
          <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-2">Cookie Policy</h3>
          <p className="text-mutedBlue text-xs">Last updated: October 12, 2025</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary text-base">1. What Are Cookies?</h4>
          <p>
            Cookies are small text files that are stored on your device when you visit our website. They help us provide a better experience and understand how our site is used.
          </p>

          <h4 className="font-bold text-primary text-base">2. How We Use Cookies</h4>
          <p>
            We use cookies for essential website functionality, performance and analytics, personalization and preferences, and marketing and advertising.
          </p>

          <h4 className="font-bold text-primary text-base">3. Managing Cookies</h4>
          <p>
            You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
