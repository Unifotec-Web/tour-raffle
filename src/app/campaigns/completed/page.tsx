import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function CampaignCompletedPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Campaign Completed"
        description="The draw has been conducted and winners have been selected."
        breadcrumb="Campaign Completed"
        bgImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto shadow-sm">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">This campaign has been completed!</h2>
          <p className="text-mutedBlue text-sm max-w-lg mx-auto">
            Thank you to everyone who participated in this campaign. The draw has been conducted and winners have been notified. Check the Winners page to see if you&apos;re a lucky winner!
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/winners" className="bg-accent hover:bg-accent-hover text-primary font-bold px-7 py-3.5 rounded-pill shadow-md transition-colors text-sm">
            View Winners
          </Link>
          <Link href="/" className="bg-white hover:bg-lightBlue text-primary font-semibold px-7 py-3.5 rounded-pill border border-borderBlue transition-colors text-sm shadow-sm">
            Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
