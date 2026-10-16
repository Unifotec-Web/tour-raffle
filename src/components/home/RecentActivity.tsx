import React from 'react';
import Link from 'next/link';
import { UserCheck, CreditCard, UserPlus, RefreshCw } from 'lucide-react';

export default function RecentActivity() {
  const activities = [
    {
      icon: <UserCheck className="w-4 h-4 text-success" />,
      bg: 'bg-success/15',
      title: 'New entry registered',
      subtitle: 'John D. from Jamaica',
      time: '2 minutes ago'
    },
    {
      icon: <CreditCard className="w-4 h-4 text-success" />,
      bg: 'bg-success/15',
      title: 'Payment received',
      subtitle: '$10.00 - Coupon Purchase',
      time: '12 minutes ago'
    },
    {
      icon: <UserPlus className="w-4 h-4 text-secondary" />,
      bg: 'bg-secondary/15',
      title: 'New entry registered',
      subtitle: 'Sarah M. from Canada',
      time: '18 minutes ago'
    },
    {
      icon: <RefreshCw className="w-4 h-4 text-secondary" />,
      bg: 'bg-secondary/15',
      title: 'Campaign updated',
      subtitle: 'Raffle details revised',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-primary tracking-tight">Recent Activity</h3>
          <Link href="#all-activity" className="text-secondary text-xs font-semibold hover:underline flex items-center gap-1">
            View all →
          </Link>
        </div>

        <div className="divide-y divide-borderBlue">
          {activities.map((item, index) => (
            <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">{item.title}</h4>
                  <p className="text-mutedBlue text-xs">{item.subtitle}</p>
                </div>
              </div>
              <span className="text-mutedBlue text-xs whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
