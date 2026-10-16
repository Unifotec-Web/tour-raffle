'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Shield, RotateCcw, Users, HeartHandshake, Cookie } from 'lucide-react';

export default function LegalSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Terms & Conditions', href: '/legal/terms', icon: <FileText className="w-4 h-4" /> },
    { name: 'Privacy Policy', href: '/legal/privacy', icon: <Shield className="w-4 h-4" /> },
    { name: 'Refund Policy', href: '/legal/refund', icon: <RotateCcw className="w-4 h-4" /> },
    { name: 'Participant Agreement', href: '/legal/agreement', icon: <Users className="w-4 h-4" /> },
    { name: 'Responsible Participation', href: '/legal/responsible', icon: <HeartHandshake className="w-4 h-4" /> },
    { name: 'Cookie Policy', href: '/legal/cookies', icon: <Cookie className="w-4 h-4" /> },
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
