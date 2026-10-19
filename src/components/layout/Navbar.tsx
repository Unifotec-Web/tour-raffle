'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plane, Search, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Current Raffle', href: '/current-raffle' },
    { name: 'Check Entry', href: '/check-entry' },
    { name: 'Winners', href: '/winners' },
    { name: 'FAQs', href: '/faqs' },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent transition-all duration-220">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group hover:scale-[1.025] transition-transform duration-180">
          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shadow-sm group-hover:bg-accent/30 transition-colors">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight leading-none">Tour Raffle</span>
            <span className="text-accent text-[10px] font-medium tracking-wider uppercase">Dream. Enter. Win.</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <div key={link.name} className="relative pb-1">
                <Link
                  href={link.href}
                  className={`transition-colors duration-150 ${isActive ? 'text-accent font-semibold' : 'hover:text-accent'}`}
                >
                  {link.name}
                </Link>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full transition-all duration-220"></span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button aria-label="Search" className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <Link
            href="/sign-in"
            className="text-white text-sm font-medium hover:text-accent transition-colors px-3 py-2 active:scale-95"
          >
            Sign In
          </Link>
          <Link
            href="/current-raffle"
            className="bg-accent hover:bg-accent-hover text-primary text-sm font-bold px-5 py-2.5 rounded-pill shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            Enter Raffle
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#002B49]/98 backdrop-blur-md px-6 py-6 border-b border-white/10 text-white space-y-4 shadow-xl transition-all">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium ${isActive ? 'text-accent' : 'hover:text-accent'}`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-pill border border-white/20 text-white font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/current-raffle"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-pill bg-accent text-primary font-bold shadow-md"
            >
              Enter Raffle
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
