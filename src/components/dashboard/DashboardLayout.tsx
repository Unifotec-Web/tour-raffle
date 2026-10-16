'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex pt-[70px]">
        <DashboardSidebar />
        <div className="flex-1 bg-[#F7FCFF] p-6 sm:p-10 min-w-0">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
