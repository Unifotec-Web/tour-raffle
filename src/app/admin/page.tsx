'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Megaphone, Users, DollarSign, Trophy, UserPlus, CreditCard, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Welcome Header */}
        <div className="bg-primary-dark text-white p-6 sm:p-8 rounded-2xl shadow-card relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80')` }}
          />
          <div className="relative z-10 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
            <p className="text-white/80 text-sm">Welcome back, Admin. Here&apos;s what&apos;s happening with your platform.</p>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-mutedBlue text-xs font-medium">Total Campaigns</span>
              <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">5</div>
              <span className="text-success text-xs font-bold mt-1 block">↑ +1 this month</span>
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-mutedBlue text-xs font-medium">Total Users</span>
              <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">24,568</div>
              <span className="text-success text-xs font-bold mt-1 block">↑ +12% this week</span>
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-mutedBlue text-xs font-medium">Total Revenue</span>
              <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">$124,780</div>
              <span className="text-success text-xs font-bold mt-1 block">↑ +8% vs last month</span>
            </div>
          </div>

          <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-mutedBlue text-xs font-medium">Total Entries</span>
              <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary">106,432</div>
              <span className="text-success text-xs font-bold mt-1 block">↑ +15% this week</span>
            </div>
          </div>
        </div>

        {/* Campaign Performance & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-xl font-extrabold text-primary tracking-tight">Campaign Performance</h3>
            <div className="h-64 bg-lightBlue rounded-xl flex items-center justify-center border border-borderBlue">
              <div className="text-center space-y-1 text-mutedBlue">
                <p className="text-sm font-bold text-primary">Performance Chart Analytics</p>
                <p className="text-xs">Live entries and revenue growth trends</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-xl font-extrabold text-primary tracking-tight">Recent Activity</h3>
            <div className="divide-y divide-borderBlue space-y-3 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center text-success"><UserPlus className="w-3.5 h-3.5" /></div>
                  <div>
                    <h4 className="font-bold text-primary">New user registered</h4>
                    <p className="text-mutedBlue text-[10px]">john.doe@example.com</p>
                  </div>
                </div>
                <span className="text-mutedBlue text-[10px]">2m ago</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center text-success"><CreditCard className="w-3.5 h-3.5" /></div>
                  <div>
                    <h4 className="font-bold text-primary">Payment received</h4>
                    <p className="text-mutedBlue text-[10px]">$45.00 - 5 coupons</p>
                  </div>
                </div>
                <span className="text-mutedBlue text-[10px]">5m ago</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center text-secondary"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                  <div>
                    <h4 className="font-bold text-primary">New entry submitted</h4>
                    <p className="text-mutedBlue text-[10px]">Code: TRF-7X9K...</p>
                  </div>
                </div>
                <span className="text-mutedBlue text-[10px]">12m ago</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
