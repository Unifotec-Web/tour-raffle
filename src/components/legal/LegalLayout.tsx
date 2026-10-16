'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import LegalSidebar from './LegalSidebar';

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  description: string;
  breadcrumb: string;
  bgImage: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, subtitle, description, breadcrumb, bgImage, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title={title}
        subtitle={subtitle}
        description={description}
        breadcrumb={breadcrumb}
        bgImage={bgImage}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-4">
            <LegalSidebar />
          </div>

          <div className="lg:col-span-8 bg-white border border-borderBlue rounded-2xl p-8 sm:p-10 shadow-card space-y-6">
            {children}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
