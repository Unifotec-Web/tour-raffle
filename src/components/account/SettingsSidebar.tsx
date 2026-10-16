'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Lock, Shield, Bell, LockKeyhole, Settings } from 'lucide-react';

export default function SettingsSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Account Settings', href: '/account/settings', icon: <Settings className="w-4 h-4" /> },
    { name: 'Profile Information', href: '/account/profile', icon: <User className="w-4 h-4" /> },
    { name: 'Change Password', href: '/account/change-password', icon: <Lock className="w-4 h-4" /> },
    { name: 'Account Security', href: '/account/security', icon: <Shield className="w-4 h-4" /> },
    { name: 'Notifications', href: '/account/notifications', icon: <Bell className="w-4 h-4" /> },
    { name: 'Privacy Settings', href: '/account/privacy', icon: <LockKeyhole className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-lightBlue border border-borderBlue rounded-2xl p-4 shadow-sm space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'text-primary hover:bg-white/60'
            }`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
