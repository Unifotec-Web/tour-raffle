import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { Search, HelpCircle, Mail, MessageSquare, Headphones } from 'lucide-react';

export default function SupportCenterPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Support Center"
        description="Get help, find answers, and resolve issues quickly."
        breadcrumb="Support Center"
        bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search for help articles..."
            className="w-full bg-lightBlue border border-borderBlue rounded-full py-4 pl-6 pr-12 text-sm text-primary placeholder-mutedBlue shadow-sm focus:outline-none focus:border-secondary transition-colors"
          />
          <Search className="absolute right-5 top-4 w-5 h-5 text-mutedBlue" />
        </div>

        {/* Popular Help Topics */}
        <div className="space-y-6">
          <h3 className="text-2xl font-extrabold text-primary tracking-tight">Popular Help Topics</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/account/settings" className="bg-lightBlue border border-borderBlue rounded-2xl p-6 shadow-sm hover:border-secondary transition-colors group">
              <HelpCircle className="w-8 h-8 text-secondary mb-3" />
              <h4 className="text-primary font-bold text-base mb-1 group-hover:text-secondary transition-colors">Account & Login</h4>
              <p className="text-mutedBlue text-xs">Manage your account, reset passwords, and secure details.</p>
            </Link>

            <Link href="/faqs" className="bg-lightBlue border border-borderBlue rounded-2xl p-6 shadow-sm hover:border-secondary transition-colors group">
              <Mail className="w-8 h-8 text-secondary mb-3" />
              <h4 className="text-primary font-bold text-base mb-1 group-hover:text-secondary transition-colors">Buying Coupons</h4>
              <p className="text-mutedBlue text-xs">Payment methods, pricing, and purchase verification.</p>
            </Link>

            <Link href="/check-entry" className="bg-lightBlue border border-borderBlue rounded-2xl p-6 shadow-sm hover:border-secondary transition-colors group">
              <MessageSquare className="w-8 h-8 text-secondary mb-3" />
              <h4 className="text-primary font-bold text-base mb-1 group-hover:text-secondary transition-colors">Entering Raffles</h4>
              <p className="text-mutedBlue text-xs">How to register codes, check entries, and follow draws.</p>
            </Link>
          </div>
        </div>

        {/* Contact Support Banner */}
        <div className="bg-primary-dark rounded-2xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 shadow">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Still need help?</h3>
              <p className="text-white/80 text-sm">Our support team is available 24/7 to assist you.</p>
            </div>
          </div>
          <Link
            href="/support/contact"
            className="bg-accent hover:bg-accent-hover text-primary font-bold px-7 py-3 rounded-pill shadow transition-transform transform hover:scale-105 text-sm shrink-0"
          >
            Contact Support →
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}
