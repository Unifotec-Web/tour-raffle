'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TrustIndicators from './TrustIndicators';

interface AuthLayoutProps {
  title: string;
  highlight?: string;
  description: string;
  bgImage: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, highlight, description, bgImage, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-70px)] pt-[70px]">

        {/* Left Image Panel (col-span-6) */}
        <div className="lg:col-span-6 relative bg-primary-dark p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{ backgroundImage: `linear-gradient(135deg, rgba(0, 43, 73, 0.95) 0%, rgba(0, 34, 56, 0.85) 100%), url('${bgImage}')` }}
          />

          <div className="relative z-10 space-y-4 max-w-lg">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight lg:leading-none">
              {title} {highlight && <span className="text-accent">{highlight}</span>}
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          </div>

          <div className="relative z-10 pt-8">
            <TrustIndicators />
          </div>
        </div>

        {/* Right Form Panel (col-span-6) */}
        <div className="lg:col-span-6 bg-lightBlue p-8 sm:p-12 lg:p-16 flex items-center justify-center">
          <div className="w-full max-w-md bg-white border border-borderBlue rounded-2xl p-8 shadow-card">
            {children}
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
