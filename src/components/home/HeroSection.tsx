import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[620px] pt-28 pb-32 flex items-center bg-primary-dark overflow-hidden">
      {/* Background Image with Gradient Overlay using hero.png */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0, 31, 56, 0.92) 0%, rgba(0, 44, 73, 0.70) 50%, rgba(0, 44, 73, 0.20) 100%), url('/hero.png')`
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-block mb-3">
            <span className="text-white text-xs font-semibold tracking-widest uppercase bg-white/10 px-3 py-1 rounded-full border border-white/15">
              YOUR DREAMS. YOUR CHOICE.
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Your Next Big Win <br />
            <span className="text-accent">Starts Here.</span>
          </h1>

          {/* Description */}
          <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-8 max-w-xl font-normal">
            Discover Tour Raffle, register your unique entry code, and take part in a transparent prize draw. Every valid entry counts toward the campaign&apos;s 450,000-entry limit.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="#enter-raffle"
              className="bg-accent hover:bg-accent-hover text-primary font-bold px-7 py-3.5 rounded-pill shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              Enter Raffle
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="bg-transparent hover:bg-white/10 text-white font-medium px-7 py-3.5 rounded-pill border border-white/35 transition-all"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
