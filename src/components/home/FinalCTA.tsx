import React from 'react';
import Link from 'next/link';
import { ArrowRight, Plane } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden py-16 px-6 sm:px-12 text-center shadow-card bg-primary-dark">
          {/* Background Image with Dark Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 31, 56, 0.95) 0%, rgba(0, 44, 73, 0.85) 100%), url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80')`
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 mx-auto flex items-center justify-center text-accent shadow">
              <Plane className="w-6 h-6 -rotate-45" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Next Big Win Starts Here.
            </h2>

            <p className="text-white/85 text-base sm:text-lg max-w-lg mx-auto">
              Don&apos;t miss your chance to be part of something amazing.
            </p>

            <div className="pt-2">
              <Link
                href="/current-raffle"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold px-8 py-4 rounded-pill shadow-lg transition-all transform hover:scale-105 text-base"
              >
                Enter Raffle
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
