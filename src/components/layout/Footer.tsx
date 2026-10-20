'use client';

import React from 'react';
import Link from 'next/link';
import { Plane } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

        {/* Column 1: Logo & Tagline */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-sm">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-tight leading-none">Tour Raffle</span>
              <span className="text-accent text-[10px] font-medium tracking-wider uppercase">Dream. Enter. Win.</span>
            </div>
          </Link>
          <p className="text-mutedBlue text-sm leading-relaxed max-w-xs">
            Your premier platform for transparent, secure, and exciting tropical travel raffle experiences. Every valid entry brings you closer to paradise.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 tracking-tight">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-mutedBlue">
            <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
            <li><Link href="/how-it-works" className="hover:text-accent transition-colors">How It Works</Link></li>
            <li><Link href="/current-raffle" className="hover:text-accent transition-colors">Current Raffle</Link></li>
            <li><Link href="/check-entry" className="hover:text-accent transition-colors">Check Entry</Link></li>
            <li><Link href="/winners" className="hover:text-accent transition-colors">Winners</Link></li>
            <li><Link href="/faqs" className="hover:text-accent transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Column 3: Policies */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 tracking-tight">Policies</h4>
          <ul className="space-y-2.5 text-sm text-mutedBlue">
            <li><Link href="/legal/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
            <li><Link href="/legal/responsible" className="hover:text-accent transition-colors">Responsible Participation</Link></li>
          </ul>
        </div>


      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-mutedBlue gap-4">
        <p>© 2025 Tour Raffle. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/legal/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <span>|</span>
          <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
