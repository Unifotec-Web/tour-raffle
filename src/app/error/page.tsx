'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ServerCrash } from 'lucide-react';

export default function ServerErrorPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 bg-lightBlue pt-[100px] pb-16">
        <div className="w-full max-w-lg bg-white border border-borderBlue rounded-2xl p-10 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto shadow-sm">
            <ServerCrash className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">500 — Server Error</h1>
            <p className="text-mutedBlue text-sm">
              Something went wrong on our end. Please try again later.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-colors text-sm">
              Try Again
            </button>
            <Link href="/" className="bg-white hover:bg-lightBlue text-primary font-semibold px-6 py-3 rounded-pill border border-borderBlue transition-colors text-sm shadow-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
