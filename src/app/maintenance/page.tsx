'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 bg-lightBlue pt-[100px] pb-16">
        <div className="w-full max-w-lg bg-white border border-borderBlue rounded-2xl p-10 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto shadow-sm">
            <Wrench className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">We&apos;ll Be Right Back</h1>
            <p className="text-mutedBlue text-sm">
              Our website is currently under maintenance to serve you better. We&apos;ll be back online soon!
            </p>
          </div>

          <button onClick={() => window.location.reload()} className="bg-accent hover:bg-accent-hover text-primary font-bold px-7 py-3.5 rounded-pill shadow-md transition-colors text-sm">
            Try Again Later
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
