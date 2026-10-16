'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Ticket,
  Users,
  CreditCard,
  CheckSquare,
  Trophy,
  FileSpreadsheet,
  ShieldAlert,
  Settings
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Campaigns', href: '/admin/campaigns', icon: <Megaphone className="w-4 h-4" /> },
    { name: 'Coupons', href: '/admin/coupons', icon: <Ticket className="w-4 h-4" /> },
    { name: 'Users', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { name: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Entries', href: '/admin/entries', icon: <CheckSquare className="w-4 h-4" /> },
    { name: 'Draws', href: '/admin/draws', icon: <Trophy className="w-4 h-4" /> },
    { name: 'Reports', href: '/admin/exports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { name: 'Audit', href: '/admin/audit', icon: <ShieldAlert className="w-4 h-4" /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="w-64 bg-primary-dark text-white min-h-[calc(100vh-70px)] p-4 flex flex-col justify-between shrink-0 border-r border-white/10 hidden md:flex">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold text-accent uppercase tracking-wider">Admin Portal</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-primary font-bold shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
