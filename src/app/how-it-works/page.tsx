import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { ArrowRight, Tag, Code, FileText, Trophy } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '1',
      icon: <Tag className="w-5 h-5 text-secondary" />,
      title: 'Purchase a Coupon',
      desc: 'Buy a raffle coupon through our secure payment method and get your unique code.'
    },
    {
      num: '2',
      icon: <Code className="w-5 h-5 text-secondary" />,
      title: 'Receive Your Unique Code',
      desc: 'Get your unique coupon code via email and in your account dashboard.'
    },
    {
      num: '3',
      icon: <FileText className="w-5 h-5 text-secondary" />,
      title: 'Register Your Entry',
      desc: 'Enter your coupon code and complete the simple registration process.'
    },
    {
      num: '4',
      icon: <Trophy className="w-5 h-5 text-secondary" />,
      title: 'Follow the Draw',
      desc: 'Watch the official draw and see if you\'re the lucky winner!'
    }
  ];

  const detailedSteps = [
    {
      num: '1',
      title: 'Purchase a Coupon',
      desc: 'Choose your preferred raffle, select the number of coupons, and complete your secure payment.',
      img: 'https://images.unsplash.com/photo-1556742049-0a67d553c2a5?auto=format&fit=crop&w=800&q=80'
    },
    {
      num: '2',
      title: 'Get Your Unique Code',
      desc: 'After payment, you\'ll receive your unique coupon code via email and in your account dashboard.',
      img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
    },
    {
      num: '3',
      title: 'Register Your Entry',
      desc: 'Enter your coupon code on the check entry page to register for the raffle.',
      img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
    },
    {
      num: '4',
      title: 'Watch the Draw',
      desc: 'The official draw will be conducted and winners will be notified via email and in their account dashboard.',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="How It Works"
        subtitle="Simple Steps to Your Dream Vacation"
        description="Getting your chance to win is easy. Follow these 4 simple steps and you could be on your way to an unforgettable adventure."
        breadcrumb="How It Works"
        bgImage="https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Process Introduction */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">The Process is Simple</h2>
          <p className="text-textBlue text-sm">Just 4 easy steps to enter and win</p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card flex flex-col items-center text-center relative">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-4 shadow">
                {s.num}
              </div>
              <div className="w-12 h-12 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <h3 className="text-primary font-bold text-base mb-2">{s.title}</h3>
              <p className="text-mutedBlue text-xs leading-relaxed">{s.desc}</p>
              <div className="mt-4 pt-3 border-t border-borderBlue w-full flex justify-center text-secondary">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Steps Timeline */}
        <div className="bg-lightBlue border border-borderBlue rounded-2xl p-8 sm:p-10 space-y-10">
          <h3 className="text-2xl font-extrabold text-primary tracking-tight">Detailed Steps</h3>

          <div className="space-y-8">
            {detailedSteps.map((ds, idx) => (
              <div key={idx} className="bg-white border border-borderBlue rounded-xl p-6 shadow-sm flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary text-white font-extrabold flex items-center justify-center shrink-0 shadow">
                    {ds.num}
                  </div>
                  <div>
                    <h4 className="text-primary font-bold text-lg mb-2">{ds.title}</h4>
                    <p className="text-mutedBlue text-sm leading-relaxed">{ds.desc}</p>
                  </div>
                </div>
                <div className="w-full lg:w-[280px] h-[160px] rounded-lg overflow-hidden shrink-0 shadow-sm border border-borderBlue">
                  <img src={ds.img} alt={ds.title} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="relative rounded-2xl overflow-hidden py-12 px-8 bg-primary-dark text-center shadow-card">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80')` }}
          />
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="font-caveat text-4xl sm:text-5xl text-white font-medium">
              Dreams Don&apos;t Work Unless You Do!
            </h3>
            <div className="pt-2">
              <Link
                href="/raffles/maldives"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold px-7 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm"
              >
                Enter Raffle Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
