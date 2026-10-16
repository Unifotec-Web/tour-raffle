'use client';

import React from 'react';
import Link from 'next/link';
import { Plane, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

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
            <li><Link href="#how-it-works" className="hover:text-accent transition-colors">How It Works</Link></li>
            <li><Link href="#current-raffle" className="hover:text-accent transition-colors">Current Raffle</Link></li>
            <li><Link href="#check-entry" className="hover:text-accent transition-colors">Check Entry</Link></li>
            <li><Link href="#winners" className="hover:text-accent transition-colors">Winners</Link></li>
            <li><Link href="#faqs" className="hover:text-accent transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 tracking-tight">Support</h4>
          <ul className="space-y-2.5 text-sm text-mutedBlue">
            <li><Link href="#contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
            <li><Link href="#help" className="hover:text-accent transition-colors">Help Center</Link></li>
            <li><Link href="#terms" className="hover:text-accent transition-colors">Terms & Conditions</Link></li>
            <li><Link href="#privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
            <li><Link href="#responsible" className="hover:text-accent transition-colors">Responsible Participation</Link></li>
          </ul>
        </div>

        {/* Column 4: Stay Connected */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-base mb-4 tracking-tight">Stay Connected</h4>
          <div className="flex items-center gap-3">
            {/* Facebook */}
            <a href="#facebook" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* Twitter / X */}
            <a href="#twitter" aria-label="Twitter" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* Instagram */}
            <a href="#instagram" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* YouTube */}
            <a href="#youtube" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>

          <div className="pt-2">
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white/5 border border-white/15 rounded-pill py-2.5 pl-4 pr-12 text-sm text-white placeholder-mutedBlue focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1.5 w-8 h-8 rounded-pill bg-accent text-primary flex items-center justify-center hover:bg-accent-hover transition-colors shadow"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-mutedBlue gap-4">
        <p>© 2025 Tour Raffle. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="#terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <span>|</span>
          <Link href="#privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>|</span>
          <Link href="#support" className="hover:text-white transition-colors">Support</Link>
        </div>
      </div>
    </footer>
  );
}
