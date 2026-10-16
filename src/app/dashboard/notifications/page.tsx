import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Bell, CreditCard, CheckCircle2, Trophy, Headphones, Gift } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      icon: <CreditCard className="w-4 h-4 text-success" />,
      title: 'Payment Successful',
      desc: 'Your payment of $20.00 was processed successfully.',
      time: 'Oct 12, 2025 - 10:24 AM',
      unread: true
    },
    {
      icon: <CheckCircle2 className="w-4 h-4 text-success" />,
      title: 'Entry Confirmed',
      desc: 'Your entry #TR-7845 has been confirmed for Maldives Paradise.',
      time: 'Oct 11, 2025 - 03:12 PM',
      unread: true
    },
    {
      icon: <Trophy className="w-4 h-4 text-secondary" />,
      title: 'New Raffle Announcement',
      desc: 'The next raffle (Paris Getaway) is now live! Don\'t miss out!',
      time: 'Oct 10, 2025 - 09:45 AM',
      unread: false
    },
    {
      icon: <Headphones className="w-4 h-4 text-secondary" />,
      title: 'Support Ticket Update',
      desc: 'Your support ticket #ST-4587 has been updated.',
      time: 'Oct 08, 2025 - 02:20 PM',
      unread: false
    },
    {
      icon: <Gift className="w-4 h-4 text-accent" />,
      title: 'Welcome to Tour Raffle',
      desc: 'Thanks for joining! Start your journey with your first purchase.',
      time: 'Oct 05, 2025 - 11:10 AM',
      unread: false
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Notifications</h1>
            <p className="text-mutedBlue text-sm">Stay updated with your raffle activity, payments and important announcements.</p>
          </div>
          <button className="text-secondary text-xs font-semibold hover:underline">
            Mark all as read
          </button>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card space-y-3">
          {notifications.map((n, idx) => (
            <div key={idx} className={`p-4 rounded-xl border transition-colors flex items-start gap-4 ${n.unread ? 'bg-lightBlue/60 border-secondary/30' : 'bg-white border-borderBlue'}`}>
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-primary text-sm flex items-center gap-2">
                    {n.title}
                    {n.unread && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
                  </h4>
                  <span className="text-[11px] text-mutedBlue">{n.time}</span>
                </div>
                <p className="text-mutedBlue text-xs leading-relaxed">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
