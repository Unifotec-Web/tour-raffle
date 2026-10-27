'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plane, Menu, X } from 'lucide-react';
import { logoutSession, useSession } from '@/lib/session';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const pathname = usePathname();
  const session = useSession(pathname);
  const signedIn = session.status === 'signed-in';
  const admin = signedIn && ['admin', 'super_admin'].includes(session.user!.role);
  const portal = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Current Raffle', href: '/current-raffle' },
    { name: 'Check Entry', href: '/check-entry' },
    { name: 'Winners', href: '/winners' },
    { name: 'FAQs', href: '/faqs' },
  ];
  const mobileAccountLinks = admin
    ? [
        { name: 'Admin Portal', href: '/admin/campaigns' },
        { name: 'Payments', href: '/admin/payments' },
        { name: 'Draws', href: '/admin/draws' },
        { name: 'Claims', href: '/admin/claims' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Account', href: '/account/settings' },
      ]
    : signedIn
      ? [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'My Coupons', href: '/dashboard/coupons' },
          { name: 'My Entries', href: '/dashboard/entries' },
          { name: 'My Payments', href: '/dashboard/payments' },
          { name: 'My Wins', href: '/dashboard/draws/my-wins' },
          { name: 'Account', href: '/account/settings' },
        ]
      : [];

  const signOut = async () => {
    setLogoutPending(true); setLogoutError('');
    try {
      await logoutSession();
      setMobileMenuOpen(false);
      window.location.assign('/');
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to sign out.');
      setLogoutPending(false);
    }
  };

  return (
    <header className={`absolute top-0 left-0 right-0 z-50 transition-all duration-220 ${portal ? 'bg-primary-dark' : 'bg-transparent'}`}>
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
          {session.status === 'signed-out' && <>
            <Link href="/sign-in" className="text-white text-sm font-medium hover:text-accent transition-colors px-3 py-2 active:scale-95">Sign In</Link>
            <Link href="/current-raffle" className="bg-accent hover:bg-accent-hover text-primary text-sm font-bold px-5 py-2.5 rounded-pill shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95">Enter Raffle</Link>
          </>}
          {signedIn && <>
            <Link href="/account/settings" className="text-white text-sm font-medium hover:text-accent transition-colors px-3 py-2">Account</Link>
            <button type="button" onClick={signOut} disabled={logoutPending} className="text-white text-sm font-medium hover:text-accent transition-colors px-3 py-2 disabled:opacity-60">{logoutPending ? 'Signing Out…' : 'Log Out'}</button>
            <Link href={admin ? '/admin/campaigns' : '/dashboard'} className="bg-accent hover:bg-accent-hover text-primary text-sm font-bold px-5 py-2.5 rounded-pill shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95">{admin ? 'Admin Portal' : 'Dashboard'}</Link>
          </>}
          {logoutError && <span role="alert" className="text-red-200 text-xs">{logoutError}</span>}
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
          {mobileAccountLinks.length > 0 && <div className="space-y-4 border-b border-white/10 pb-4">
            {mobileAccountLinks.map(link => <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`block text-base font-medium ${pathname === link.href ? 'text-accent' : 'hover:text-accent'}`}>{link.name}</Link>)}
          </div>}
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
            {session.status === 'signed-out' && <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-pill border border-white/20 text-white font-medium"
            >
              Sign In
            </Link>}
            {session.status === 'signed-out' && <Link
              href="/current-raffle"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-pill bg-accent text-primary font-bold shadow-md"
            >
              Enter Raffle
            </Link>}
            {signedIn && <button type="button" onClick={signOut} disabled={logoutPending} className="text-center py-2.5 rounded-pill border border-white/20 text-white font-medium disabled:opacity-60">{logoutPending ? 'Signing Out…' : 'Log Out'}</button>}
            {logoutError && <p role="alert" className="text-red-200 text-xs">{logoutError}</p>}
          </div>
        </div>
      )}
    </header>
  );
}
