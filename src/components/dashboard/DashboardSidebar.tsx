'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  CheckSquare,
  Trophy,
  CreditCard,
  History,
  Bell,
  Headphones,
  UserCog
} from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'My Coupons', href: '/dashboard/coupons', icon: <Ticket className="w-4 h-4" /> },
    { name: 'My Entries', href: '/dashboard/entries', icon: <CheckSquare className="w-4 h-4" /> },
    { name: 'My Wins', href: '/dashboard/draws/my-wins', icon: <Trophy className="w-4 h-4" /> },
    { name: 'My Payments', href: '/dashboard/payments', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Transaction History', href: '/dashboard/transactions', icon: <History className="w-4 h-4" /> },
    { name: 'Notifications', href: '/dashboard/notifications', icon: <Bell className="w-4 h-4" />, badge: 2 },
    { name: 'Support Tickets', href: '/dashboard/support', icon: <Headphones className="w-4 h-4" /> },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: <UserCog className="w-4 h-4" /> },
  ];

  return (
    <div className="w-64 bg-primary-dark text-white min-h-[calc(100vh-70px)] p-4 flex flex-col justify-between shrink-0 border-r border-white/10 hidden md:flex">
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-primary font-bold shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-primary text-white' : 'bg-accent text-primary'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
