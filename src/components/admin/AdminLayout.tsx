'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex pt-[70px]">
        <AdminSidebar />
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
