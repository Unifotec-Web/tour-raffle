'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { Tag, Database, Globe, Check, ShieldCheck, ExternalLink, Link2, Calendar, Headphones, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function RaffleDetailsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'prizes' | 'terms'>('overview');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const carouselImages = [
    { title: 'The Maldives', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Bora Bora', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Santorini', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' }
  ];

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Current Raffle"
        subtitle="The Ultimate Getaway"
        description="A once-in-a-lifetime travel experience to the Maldives. Luxury resorts, crystal clear waters, and unforgettable memories await."
        breadcrumb="Current Raffle"
        bgImage="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Main Raffle Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Main Overview Card (col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

              <div className="md:col-span-5 h-[260px] md:h-[300px] rounded-xl overflow-hidden relative shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1000&q=80"
                  alt="Maldives"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-primary tracking-tight">The Ultimate Getaway</h3>
                    <p className="text-textBlue text-sm font-medium">Maldives, Indian Ocean</p>
                  </div>
                  <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full border border-success/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    Open
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-borderBlue">
                  <div>
                    <div className="text-mutedBlue text-xs mb-0.5">Coupon Price</div>
                    <div className="text-primary font-bold text-base">$10</div>
                  </div>
                  <div>
                    <div className="text-mutedBlue text-xs mb-0.5">Total Entries</div>
                    <div className="text-primary font-bold text-base">450,000</div>
                  </div>
                  <div>
                    <div className="text-mutedBlue text-xs mb-0.5">Eligibility</div>
                    <div className="text-primary font-bold text-xs truncate">Multiple Destinations</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-mutedBlue">Campaign Progress</span>
                    <span className="text-primary">27.9%</span>
                  </div>
                  <div className="h-3 bg-lightBlue rounded-pill overflow-hidden p-0.5 border border-borderBlue">
                    <div className="h-full bg-accent rounded-pill" style={{ width: '27.9%' }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-mutedBlue">
                  <div>Valid: <strong className="text-primary">125,432</strong></div>
                  <div>Remaining: <strong className="text-primary">324,568</strong></div>
                  <div>Limit: <strong className="text-primary">450,000</strong></div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="#enter"
                    className="flex-1 text-center bg-accent hover:bg-accent-hover text-primary font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all"
                  >
                    Enter Raffle Now →
                  </Link>
                  <Link
                    href="#details"
                    className="flex-1 text-center bg-white hover:bg-lightBlue text-primary font-semibold text-sm py-3 px-4 rounded-xl border border-borderBlue transition-colors shadow-sm"
                  >
                    View Full Details
                  </Link>
                </div>

              </div>
            </div>
          </div>

          {/* Right: Why Choose Tour Raffle (col-span-4) */}
          <div className="lg:col-span-4 bg-lightBlue border border-borderBlue rounded-2xl p-6 shadow-card">
            <h3 className="text-xl font-extrabold text-primary mb-6 tracking-tight">Why Choose Tour Raffle?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Unique Coupon Codes</h4>
                  <p className="text-mutedBlue text-xs">Each code is unique and single-use.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Single-Use Validation</h4>
                  <p className="text-mutedBlue text-xs">Prevents duplicate entries and fraud.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Transparent Progress</h4>
                  <p className="text-mutedBlue text-xs">Live campaign updates and verified data.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Secure Draw Process</h4>
                  <p className="text-mutedBlue text-xs">Fair and independently verifiable.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Published Results</h4>
                  <p className="text-mutedBlue text-xs">Official winners and results.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Reliable Support</h4>
                  <p className="text-mutedBlue text-xs">Get help when you need it.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Destination Image Banner */}
        <div className="h-[260px] sm:h-[320px] rounded-2xl overflow-hidden shadow-card relative">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
            alt="Maldives banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* How It Works Section */}
        <div className="bg-primary-dark rounded-2xl p-8 sm:p-12 text-white text-center shadow-card relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80')` }}
          />
          <div className="relative z-10 space-y-8 max-w-5xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div className="bg-white rounded-xl p-5 text-primary">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-3">1</div>
                <h4 className="font-bold text-sm mb-1">Purchase a Coupon</h4>
                <p className="text-mutedBlue text-xs">Buy a $10 coupon securely.</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-primary">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-3">2</div>
                <h4 className="font-bold text-sm mb-1">Receive Your Unique Code</h4>
                <p className="text-mutedBlue text-xs">Get code via email & dashboard.</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-primary">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-3">3</div>
                <h4 className="font-bold text-sm mb-1">Register Your Entry</h4>
                <p className="text-mutedBlue text-xs">Submit code on platform.</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-primary">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center mb-3">4</div>
                <h4 className="font-bold text-sm mb-1">Follow the Draw</h4>
                <p className="text-mutedBlue text-xs">Monitor campaign progress.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Promotional Carousel */}
        <div className="relative rounded-2xl overflow-hidden h-[300px] shadow-card flex items-center">
          <img
            src={carouselImages[carouselIndex].img}
            alt="Carousel destination"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 via-primary-dark/60 to-transparent" />

          <div className="relative z-10 px-8 sm:px-12 max-w-xl space-y-4 text-white">
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore Your Dream Destination</h3>
            <p className="text-white/80 text-sm">
              {carouselImages[carouselIndex].title} is just one of many incredible destinations you could win with Tour Raffle.
            </p>
            <div>
              <Link
                href="#enter"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-transform transform hover:scale-105 text-sm"
              >
                Enter Raffle Now →
              </Link>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="absolute right-6 bottom-6 z-20 flex items-center gap-3">
            <button onClick={prevSlide} aria-label="Previous slide" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextSlide} aria-label="Next slide" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Campaign Details Tabs */}
        <div className="bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <h3 className="text-2xl font-extrabold text-primary tracking-tight">Campaign Details</h3>

          {/* Tabs header */}
          <div className="flex border-b border-borderBlue gap-8 text-sm font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-secondary text-secondary' : 'border-transparent text-mutedBlue hover:text-primary'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('prizes')}
              className={`pb-3 border-b-2 transition-colors ${activeTab === 'prizes' ? 'border-secondary text-secondary' : 'border-transparent text-mutedBlue hover:text-primary'}`}
            >
              Prizes
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`pb-3 border-b-2 transition-colors ${activeTab === 'terms' ? 'border-secondary text-secondary' : 'border-transparent text-mutedBlue hover:text-primary'}`}
            >
              Terms & Conditions
            </button>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div className="lg:col-span-8 space-y-4">
              {activeTab === 'overview' && (
                <>
                  <h4 className="text-xl font-bold text-primary">The Ultimate Getaway</h4>
                  <p className="text-mutedBlue text-sm leading-relaxed">
                    Experience the Maldives with luxury accommodation, round-trip flights and exclusive experiences. This is your chance to escape the ordinary and create unforgettable memories in paradise.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-borderBlue text-xs">
                    <div>
                      <span className="text-mutedBlue block">Destination</span>
                      <strong className="text-primary">Maldives, Indian Ocean</strong>
                    </div>
                    <div>
                      <span className="text-mutedBlue block">Duration</span>
                      <strong className="text-primary">Oct 12, 2025 – Dec 31, 2025</strong>
                    </div>
                    <div>
                      <span className="text-mutedBlue block">Total Entries</span>
                      <strong className="text-primary">450,000</strong>
                    </div>
                    <div>
                      <span className="text-mutedBlue block">Draw Date</span>
                      <strong className="text-primary">Jan 15, 2026</strong>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'prizes' && (
                <>
                  <h4 className="text-xl font-bold text-primary">Prize Package Details</h4>
                  <p className="text-mutedBlue text-sm leading-relaxed">
                    The lucky winner of this campaign will receive a fully inclusive luxury vacation package designed for ultimate relaxation and adventure.
                  </p>
                </>
              )}

              {activeTab === 'terms' && (
                <>
                  <h4 className="text-xl font-bold text-primary">Campaign Terms & Conditions</h4>
                  <p className="text-mutedBlue text-sm leading-relaxed">
                    Participants must be 18 years or older. Coupons are non-refundable once registered. Draws are conducted independently and verified for fairness.
                  </p>
                </>
              )}
            </div>

            {/* Right: Prize Includes Card */}
            <div className="lg:col-span-4 bg-lightBlue border border-borderBlue rounded-xl p-6 shadow-sm space-y-4">
              <h4 className="text-primary font-bold text-base">Prize Includes</h4>
              <ul className="space-y-3 text-xs text-textBlue font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  7 Nights Luxury Resort Stay
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Round-trip Flight Tickets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Airport Transfers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Daily Breakfast
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Island Tours & Activities
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Travel Insurance
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
