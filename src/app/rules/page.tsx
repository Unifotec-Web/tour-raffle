import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';

export default function OfficialRulesPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Official Rules"
        description="Please read the official rules carefully before participating in the Tour Raffle."
        breadcrumb="Official Rules"
        bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-textBlue text-sm leading-relaxed">
        <div className="space-y-3">
          <h3 className="text-2xl font-extrabold text-primary tracking-tight">1. General Rules</h3>
          <p>1. The Tour Raffle is a promotional sweepstakes and not a game of chance.</p>
          <p>2. No purchase is necessary to enter or win.</p>
          <p>3. The raffle is open to eligible participants only, as defined in the Eligibility Requirements.</p>
          <p>4. Entries must be submitted through the official Tour Raffle website.</p>
          <p>5. All decisions are final and binding on all participants.</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-borderBlue">
          <h3 className="text-2xl font-extrabold text-primary tracking-tight">2. How to Enter</h3>
          <p>1. Purchase raffle coupons or use a free entry method (if available).</p>
          <p>2. Provide accurate and complete information.</p>
          <p>3. Each valid entry receives a unique code for the draw.</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
