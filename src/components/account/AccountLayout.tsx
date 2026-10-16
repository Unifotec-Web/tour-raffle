'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import SettingsSidebar from './SettingsSidebar';

interface AccountLayoutProps {
  title: string;
  description: string;
  breadcrumb: string;
  children: React.ReactNode;
}

export default function AccountLayout({ title, description, breadcrumb, children }: AccountLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title={title}
        description={description}
        breadcrumb={breadcrumb}
        bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar (col-span-4) */}
          <div className="lg:col-span-4">
            <SettingsSidebar />
          </div>

          {/* Content (col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-borderBlue rounded-2xl p-8 shadow-card">
            {children}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
