import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { Trophy, Gift, DollarSign, Globe, ArrowRight } from 'lucide-react';

export default function WinnersPage() {
  const winners = [
    {
      name: 'Sarah M.',
      country: 'Canada',
      flag: '🇨🇦',
      won: 'Santorini, Greece',
      date: 'Oct 12, 2025',
      quote: '"I still can\'t believe it! This is a dream come true. Thank you Tour Raffle!"',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'James K.',
      country: 'United Kingdom',
      flag: '🇬🇧',
      won: 'Bali, Indonesia',
      date: 'Sep 28, 2025',
      quote: '"The experience was absolutely incredible. Best trip of my life!"',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Fatima A.',
      country: 'Ghana',
      flag: '🇬🇭',
      won: 'Paris, France',
      date: 'Sep 15, 2025',
      quote: '"Tour Raffle made my dream of visiting Paris a reality. Amazing!"',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Daniel T.',
      country: 'United States',
      flag: '🇺🇸',
      won: 'Maldives',
      date: 'Aug 30, 2025',
      quote: '"This is the best platform ever. I\'m so grateful!"',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Aisha B.',
      country: 'Nigeria',
      flag: '🇳🇬',
      won: 'Dubai, UAE',
      date: 'Aug 17, 2025',
      quote: '"From entry to winning, everything was smooth. Thank you!"',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Kwame S.',
      country: 'Ghana',
      flag: '🇬🇭',
      won: 'Phuket, Thailand',
      date: 'Jul 25, 2025',
      quote: '"I never thought I could win. This is life changing!"',
      image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Our Winners"
        subtitle="Real People. Real Dreams. Real Winners."
        description="Meet the lucky people who have won amazing travel experiences with Tour Raffle. Your dream could be next!"
        breadcrumb="Winners"
        bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Statistics Bar */}
        <div className="bg-primary-dark rounded-2xl p-6 sm:p-8 text-white shadow-card grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex flex-col items-center pt-2 md:pt-0">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-mutedBlue text-xs font-medium">Total Winners</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1">48</span>
          </div>
          <div className="flex flex-col items-center pt-4 md:pt-0">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-2">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-mutedBlue text-xs font-medium">Total Prizes</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1">48</span>
          </div>
          <div className="flex flex-col items-center pt-4 md:pt-0">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-2">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-mutedBlue text-xs font-medium">Total Value</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1">$1,240,000+</span>
          </div>
          <div className="flex flex-col items-center pt-4 md:pt-0">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-2">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-mutedBlue text-xs font-medium">Countries</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1">18</span>
          </div>
        </div>

        {/* Latest Winners Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-extrabold text-primary tracking-tight">Latest Winners</h3>
          <Link href="/winners" className="text-secondary text-sm font-semibold hover:underline">
            View All Winners →
          </Link>
        </div>

        {/* Winner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {winners.map((w, idx) => (
            <div key={idx} className="bg-white border border-borderBlue rounded-2xl overflow-hidden shadow-card flex flex-col justify-between">
              <div>
                <div className="h-48 relative overflow-hidden">
                  <img src={w.image} alt={w.won} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-primary font-bold text-base">{w.name}</h4>
                      <p className="text-mutedBlue text-xs flex items-center gap-1.5">
                        <span>{w.flag}</span> {w.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-mutedBlue block">Draw Date</span>
                      <span className="text-primary font-bold text-xs">{w.date}</span>
                    </div>
                  </div>

                  <div className="bg-lightBlue rounded-xl p-3 text-xs">
                    <strong className="text-secondary block mb-0.5">Won: {w.won}</strong>
                  </div>

                  <p className="text-primary text-xs italic leading-relaxed">
                    {w.quote}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Be the Next Winner Banner */}
        <div className="bg-lightBlue border border-borderBlue rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center shrink-0 shadow">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-1">Be the Next Winner!</h3>
              <p className="text-mutedBlue text-sm">Thousands of people have already won. It could be you!</p>
            </div>
          </div>
          <Link
            href="/raffles/maldives"
            className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-transform transform hover:scale-105 text-sm shrink-0 flex items-center gap-2"
          >
            Enter Raffle Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}
