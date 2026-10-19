'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicCampaign, PublicCampaign } from '@/lib/public-campaigns';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { Tag, Database, Globe, Check, ShieldCheck, ExternalLink, Link2, Calendar, Headphones, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function RaffleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { publicCampaign(id).then(setCampaign).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [id]);
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
        subtitle={campaign?.name ?? 'Campaign Details'}
        description={campaign?.description || 'Campaign information and registration status.'}
        breadcrumb="Current Raffle"
        bgImage="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {loading && <div role="status" className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card text-mutedBlue">Loading campaign...</div>}
        {error && <div role="alert" className="bg-white border border-red-500/30 rounded-2xl p-6 shadow-card text-red-500">{error}</div>}
        {!loading && !error && !campaign && <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card text-mutedBlue">This campaign is unavailable. <Link href="/current-raffle" className="text-secondary font-bold">View available campaigns</Link></div>}
        {campaign && <>

        {/* Main Raffle Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Main Overview Card (col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

              <div className="md:col-span-5 h-[260px] md:h-[300px] rounded-xl overflow-hidden relative shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1000&q=80"
                  alt="Travel destination"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-primary tracking-tight">{campaign.name}</h3>
                    <p className="text-textBlue text-sm font-medium">{campaign.destination}</p>
                  </div>
                  <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full border border-success/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    {campaign.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-borderBlue">
                  <div>
                    <div className="text-mutedBlue text-xs mb-0.5">Coupon Price</div>
                    <div className="text-primary font-bold text-base">${campaign.coupon_price_usd} USD</div>
                  </div>
                  <div>
                    <div className="text-mutedBlue text-xs mb-0.5">Entry Limit</div>
                    <div className="text-primary font-bold text-base">{campaign.max_capacity.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-mutedBlue text-xs mb-0.5">Winner Count</div>
                    <div className="text-primary font-bold text-xs truncate">{campaign.winner_count}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-mutedBlue">Campaign Progress</span>
                    <span className="text-primary">{(100 * campaign.current_entries / campaign.max_capacity).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-lightBlue rounded-pill overflow-hidden p-0.5 border border-borderBlue">
                    <div className="h-full bg-accent rounded-pill" style={{ width: `${100 * campaign.current_entries / campaign.max_capacity}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-mutedBlue">
                  <div>Valid: <strong className="text-primary">{campaign.current_entries.toLocaleString()}</strong></div>
                  <div>Checkout Slots: <strong className="text-primary">{campaign.available_checkout_slots.toLocaleString()}</strong></div>
                  <div>Limit: <strong className="text-primary">{campaign.max_capacity.toLocaleString()}</strong></div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={campaign.status === 'open' && campaign.available_checkout_slots > 0 ? '/dashboard/coupons/purchase' : '/current-raffle'}
                    className="flex-1 text-center bg-accent hover:bg-accent-hover text-primary font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all"
                  >
                    {campaign.status === 'open' && campaign.available_checkout_slots > 0 ? 'Get Coupons →' : 'View Campaigns →'}
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
                  <p className="text-mutedBlue text-xs">Campaign progress from stored entries.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Secure Draw Process</h4>
                  <p className="text-mutedBlue text-xs">Draw records are published after selection.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Published Results</h4>
                  <p className="text-mutedBlue text-xs">Draw summaries appear after publication.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Support Information</h4>
                  <p className="text-mutedBlue text-xs">Visit the help pages for information.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Destination Image Banner */}
        <div className="h-[260px] sm:h-[320px] rounded-2xl overflow-hidden shadow-card relative">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
            alt="Travel destination banner"
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
                <p className="text-mutedBlue text-xs">Find issued codes in your dashboard.</p>
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
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Travel Inspiration</h3>
            <p className="text-white/80 text-sm">
              {carouselImages[carouselIndex].title} is shown for inspiration. This campaign records {campaign.destination} as its destination.
            </p>
            <div>
              <Link
                href={campaign.status === 'open' && campaign.available_checkout_slots > 0 ? '/dashboard/coupons/purchase' : '/current-raffle'}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-transform transform hover:scale-105 text-sm"
              >
                {campaign.status === 'open' && campaign.available_checkout_slots > 0 ? 'Get Coupons →' : 'View Campaigns →'}
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
        <div id="details" className="bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
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
                  <h4 className="text-xl font-bold text-primary">{campaign.name}</h4>
                  <p className="text-mutedBlue text-sm leading-relaxed">
                    {campaign.description || 'No further description has been published.'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-borderBlue text-xs">
                    <div>
                      <span className="text-mutedBlue block">Destination</span>
                      <strong className="text-primary">{campaign.destination}</strong>
                    </div>
                    <div>
                      <span className="text-mutedBlue block">Duration</span>
                      <strong className="text-primary">{new Date(campaign.start_date).toLocaleDateString()} – {new Date(campaign.end_date).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-mutedBlue block">Total Entries</span>
                      <strong className="text-primary">{campaign.max_capacity.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-mutedBlue block">Draw Date</span>
                      <strong className="text-primary">Not scheduled in this record</strong>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'prizes' && (
                <>
                  <h4 className="text-xl font-bold text-primary">Prize Package Details</h4>
                  <p className="text-mutedBlue text-sm leading-relaxed">
                    Recorded prize value: {campaign.prize_value} {campaign.prize_currency}. Prize package details are not published in this record.
                  </p>
                </>
              )}

              {activeTab === 'terms' && (
                <>
                  <h4 className="text-xl font-bold text-primary">Campaign Terms & Conditions</h4>
                  <p className="text-mutedBlue text-sm leading-relaxed">
                    Campaign-specific eligibility and prize terms are not published in this record. Purchase alone does not create an entry; register a coupon before closure. See the available <Link href="/rules" className="text-secondary font-bold">rules page</Link> for general information.
                  </p>
                </>
              )}
            </div>

            {/* Right: Prize Includes Card */}
            <div className="lg:col-span-4 bg-lightBlue border border-borderBlue rounded-xl p-6 shadow-sm space-y-4">
              <h4 className="text-primary font-bold text-base">Published Campaign Facts</h4>
              <ul className="space-y-3 text-xs text-textBlue font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Destination: {campaign.destination}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Prize value: {campaign.prize_value} {campaign.prize_currency}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Winner count: {campaign.winner_count}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Registration status: {campaign.status}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Entry limit: {campaign.max_capacity.toLocaleString()}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  Registration deadline: {new Date(campaign.end_date).toLocaleDateString()}
                </li>
              </ul>
            </div>
          </div>

        </div>

      </>}
      </div>

      <Footer />
    </main>
  );
}
