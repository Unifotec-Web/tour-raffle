import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { Tag, Database, Globe, ArrowRight, ShieldCheck, ExternalLink, Link2, Calendar, Headphones } from 'lucide-react';

export default function CurrentRafflePage() {
  const otherRaffles = [
    {
      title: 'Maldives Paradise',
      location: 'Maldives',
      price: '$10',
      totalEntries: '250,000',
      progress: '27.2%',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Paris Getaway',
      location: 'Paris, France',
      price: '$10',
      totalEntries: '200,000',
      progress: '27.3%',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Bali Adventure',
      location: 'Bali, Indonesia',
      price: '$10',
      totalEntries: '150,000',
      progress: '36.7%',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Current Raffle"
        subtitle="The Ultimate Getaway"
        description="A once-in-a-lifetime travel experience. Enter now for a chance to win an unforgettable vacation to one of the world's most beautiful destinations."
        breadcrumb="Current Raffle"
        bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Main Raffle Card */}
        <div className="bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left: Image */}
            <div className="lg:col-span-5 h-[280px] sm:h-[320px] rounded-xl overflow-hidden relative shadow-md">
              <img
                src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80"
                alt="Bora Bora"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Info */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-primary tracking-tight">The Ultimate Getaway</h3>
                  <p className="text-textBlue text-sm font-medium">Bora Bora, French Polynesia</p>
                </div>
                <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full border border-success/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Open
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-3 border-y border-borderBlue">
                <div>
                  <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                    <Tag className="w-3.5 h-3.5 text-secondary" /> Coupon Price
                  </div>
                  <div className="text-primary font-bold text-base">$10</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                    <Database className="w-3.5 h-3.5 text-secondary" /> Total Entries
                  </div>
                  <div className="text-primary font-bold text-base">450,000</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                    <Globe className="w-3.5 h-3.5 text-secondary" /> Eligibility
                  </div>
                  <div className="text-primary font-bold text-xs truncate">Multiple Destinations</div>
                </div>
              </div>

              {/* Campaign Progress inside card */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-mutedBlue">Campaign Progress</span>
                  <span className="text-primary font-extrabold">27.9%</span>
                </div>
                <div className="h-3 bg-lightBlue rounded-pill overflow-hidden p-0.5 border border-borderBlue">
                  <div className="h-full bg-gradient-to-r from-accent to-[#FFB92E] rounded-pill" style={{ width: '27.9%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-mutedBlue pt-1">
                <div>Valid Entries: <span className="text-primary font-bold">125,432</span></div>
                <div>Remaining: <span className="text-primary font-bold">324,568</span></div>
                <div>Total Limit: <span className="text-primary font-bold">450,000</span></div>
              </div>

              <div className="text-xs text-mutedBlue">
                Live • Last updated: Oct 12, 2025 10:34 AM
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/raffles/maldives"
                  className="flex-1 text-center bg-accent hover:bg-accent-hover text-primary font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all"
                >
                  Enter Raffle Now →
                </Link>
                <Link
                  href="/raffles/maldives"
                  className="flex-1 text-center bg-white hover:bg-lightBlue text-primary font-semibold text-sm py-3 px-4 rounded-xl border border-borderBlue transition-colors shadow-sm"
                >
                  View Full Details
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* Raffle Highlights */}
        <div>
          <h3 className="text-xl font-extrabold text-primary mb-6 tracking-tight">Raffle Highlights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-3 shadow-sm">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="text-primary font-bold text-sm mb-1">Luxury Accommodation</h4>
              <p className="text-mutedBlue text-xs">Stay at 5-star resorts</p>
            </div>
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-3 shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-primary font-bold text-sm mb-1">Round-trip Flights</h4>
              <p className="text-mutedBlue text-xs">From major cities</p>
            </div>
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-3 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-primary font-bold text-sm mb-1">Exclusive Experiences</h4>
              <p className="text-mutedBlue text-xs">Tours, dining & more</p>
            </div>
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-3 shadow-sm">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h4 className="text-primary font-bold text-sm mb-1">Multiple Destinations</h4>
              <p className="text-mutedBlue text-xs">More chances to win</p>
            </div>
          </div>
        </div>

        {/* Other Active Raffles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-primary tracking-tight">Other Active Raffles</h3>
            <Link href="/current-raffle" className="text-secondary text-sm font-semibold hover:underline">
              View All Raffles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherRaffles.map((raffle, idx) => (
              <div key={idx} className="bg-white border border-borderBlue rounded-2xl overflow-hidden shadow-card flex flex-col justify-between">
                <div>
                  <div className="h-48 relative overflow-hidden">
                    <img src={raffle.image} alt={raffle.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-success text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Open
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-primary font-bold text-base">{raffle.title}</h4>
                      <p className="text-mutedBlue text-xs">{raffle.location}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-mutedBlue pt-2 border-t border-borderBlue">
                      <span>Price: <strong className="text-primary">{raffle.price}</strong></span>
                      <span>Total: <strong className="text-primary">{raffle.totalEntries}</strong></span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-mutedBlue">Progress</span>
                        <span className="text-primary">{raffle.progress}</span>
                      </div>
                      <div className="h-2 bg-lightBlue rounded-pill overflow-hidden">
                        <div className="h-full bg-accent rounded-pill" style={{ width: raffle.progress }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    href="/raffles/maldives"
                    className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    Enter Raffle →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="relative rounded-2xl overflow-hidden py-12 px-8 sm:px-12 bg-primary-dark shadow-card text-center">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 31, 56, 0.95) 0%, rgba(0, 44, 73, 0.85) 100%), url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80')`
            }}
          />
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="font-caveat text-4xl sm:text-5xl text-white font-medium">
              Your Next Big Win Could Be Just a Click Away!
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
