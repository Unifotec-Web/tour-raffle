'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Ticket, CheckSquare, DollarSign, Trophy, ArrowRight, UserCheck, CreditCard, RefreshCw } from 'lucide-react';

export default function DashboardOverviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary-dark text-white p-8 rounded-2xl shadow-card relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80')` }}
          />
          <div className="relative z-10 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Good Morning, John! 👋</h1>
            <p className="text-white/80 text-sm">Here&apos;s your raffle overview and latest activity.</p>
          </div>
          <Link
            href="/dashboard/coupons/purchase"
            className="relative z-10 bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm shrink-0"
          >
            Buy More Coupons
          </Link>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-mutedBlue text-xs font-medium">Total Coupons</span>
              <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">12</div>
              <Link href="/dashboard/coupons" className="text-secondary text-xs font-semibold hover:underline mt-1 block">
                View Details →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-mutedBlue text-xs font-medium">Total Entries</span>
              <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">45</div>
              <Link href="/dashboard/entries" className="text-secondary text-xs font-semibold hover:underline mt-1 block">
                View Details →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-mutedBlue text-xs font-medium">Total Spent</span>
              <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">$120.00</div>
              <Link href="/dashboard/payments" className="text-secondary text-xs font-semibold hover:underline mt-1 block">
                View Details →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-mutedBlue text-xs font-medium">Winning Chances</span>
              <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shadow-sm">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">0.03%</div>
              <span className="text-mutedBlue text-xs mt-1 block">Based on active entries</span>
            </div>
          </div>

        </div>

        {/* Active Raffles & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Active Raffles (col-span-6) */}
          <div className="lg:col-span-6 bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-xl font-extrabold text-primary tracking-tight">Active Raffles</h3>

            <div className="bg-lightBlue border border-borderBlue rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-primary text-base">Maldives Paradise</h4>
                  <p className="text-mutedBlue text-xs">$10 per entry - 250,000 total entries</p>
                </div>
                <span className="bg-success text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">Open</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-mutedBlue">Campaign Progress</span>
                  <span className="text-primary">18% sold</span>
                </div>
                <div className="h-2.5 bg-white rounded-pill overflow-hidden border border-borderBlue">
                  <div className="h-full bg-accent rounded-pill" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="/dashboard/coupons/purchase"
                  className="block text-center bg-accent hover:bg-accent-hover text-primary font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                >
                  Get More Coupons
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity (col-span-6) */}
          <div className="lg:col-span-6 bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-primary tracking-tight">Recent Activity</h3>
              <Link href="/dashboard/transactions" className="text-secondary text-xs font-semibold hover:underline">
                View All →
              </Link>
            </div>

            <div className="divide-y divide-borderBlue space-y-3">
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center text-success">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-primary font-bold text-sm">You purchased 2 coupons</h4>
                    <p className="text-mutedBlue text-xs">Oct 12, 2025 - 10:34 AM</p>
                  </div>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-primary font-bold text-sm">Entry #70-7845 confirmed</h4>
                    <p className="text-mutedBlue text-xs">Oct 11, 2025 - 03:12 PM</p>
                  </div>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center text-success">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-primary font-bold text-sm">Payment of $20.00 successful</h4>
                    <p className="text-mutedBlue text-xs">Oct 10, 2025 - 11:45 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
