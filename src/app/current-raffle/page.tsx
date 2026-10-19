"use client";
import { useEffect, useState } from 'react';
import { publicCampaigns, PublicCampaign } from '@/lib/public-campaigns';
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { Tag, Database, Globe, ArrowRight, ShieldCheck, ExternalLink, Link2, Calendar, Headphones } from 'lucide-react';

export default function CurrentRafflePage() {
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { publicCampaigns().then(setCampaigns).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const featured = campaigns.find(c => c.is_featured) ?? campaigns[0];
  const otherRaffles = campaigns.filter(c => c.id !== featured?.id);
  const images = ['https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Current Raffle"
        subtitle={featured?.name ?? 'Campaigns'}
        description={featured?.description || 'Explore available campaigns and their registration status.'}
        breadcrumb="Current Raffle"
        bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {loading && <div role="status" className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card text-mutedBlue">Loading campaigns...</div>}
        {error && <div role="alert" className="bg-white border border-red-500/30 rounded-2xl p-6 shadow-card text-red-500">{error}</div>}
        {!loading && !error && !featured && <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card text-mutedBlue">No campaigns are available yet.</div>}

        {/* Main Raffle Card */}
        {featured && <div className="bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card">
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
                  <h3 className="text-2xl font-extrabold text-primary tracking-tight">{featured.name}</h3>
                  <p className="text-textBlue text-sm font-medium">{featured.destination}</p>
                </div>
                <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full border border-success/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  {featured.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-3 border-y border-borderBlue">
                <div>
                  <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                    <Tag className="w-3.5 h-3.5 text-secondary" /> Coupon Price
                  </div>
                  <div className="text-primary font-bold text-base">${featured.coupon_price_usd} USD</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                    <Database className="w-3.5 h-3.5 text-secondary" /> Entry Limit
                  </div>
                  <div className="text-primary font-bold text-base">{featured.max_capacity.toLocaleString()}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                    <Globe className="w-3.5 h-3.5 text-secondary" /> Winners
                  </div>
                  <div className="text-primary font-bold text-xs truncate">{featured.winner_count}</div>
                </div>
              </div>

              {/* Campaign Progress inside card */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-mutedBlue">Campaign Progress</span>
                  <span className="text-primary font-extrabold">{(100 * featured.current_entries / featured.max_capacity).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-lightBlue rounded-pill overflow-hidden p-0.5 border border-borderBlue">
                  <div className="h-full bg-gradient-to-r from-accent to-[#FFB92E] rounded-pill" style={{ width: `${100 * featured.current_entries / featured.max_capacity}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-mutedBlue pt-1">
                <div>Valid Entries: <span className="text-primary font-bold">{featured.current_entries.toLocaleString()}</span></div>
                <div>Checkout Slots: <span className="text-primary font-bold">{featured.available_checkout_slots.toLocaleString()}</span></div>
                <div>Total Limit: <span className="text-primary font-bold">{featured.max_capacity.toLocaleString()}</span></div>
              </div>

              <div className="text-xs text-mutedBlue">
                Registration: {featured.status} • Ends {new Date(featured.end_date).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href={`/raffles/${featured.id}`}
                  className="flex-1 text-center bg-accent hover:bg-accent-hover text-primary font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all"
                >
                  View Campaign →
                </Link>
                <Link
                  href={`/raffles/${featured.id}`}
                  className="flex-1 text-center bg-white hover:bg-lightBlue text-primary font-semibold text-sm py-3 px-4 rounded-xl border border-borderBlue transition-colors shadow-sm"
                >
                  View Full Details
                </Link>
              </div>

            </div>
          </div>
        </div>}

        {/* Raffle Highlights */}
        <div>
          <h3 className="text-xl font-extrabold text-primary mb-6 tracking-tight">Campaign Highlights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-3 shadow-sm">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="text-primary font-bold text-sm mb-1">Destination</h4>
              <p className="text-mutedBlue text-xs">{featured?.destination ?? 'Unavailable'}</p>
            </div>
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-3 shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-primary font-bold text-sm mb-1">Registration Deadline</h4>
              <p className="text-mutedBlue text-xs">{featured ? new Date(featured.end_date).toLocaleDateString() : 'Unavailable'}</p>
            </div>
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-3 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-primary font-bold text-sm mb-1">Prize Value</h4>
              <p className="text-mutedBlue text-xs">{featured ? `${featured.prize_value} ${featured.prize_currency}` : 'Unavailable'}</p>
            </div>
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-3 shadow-sm">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h4 className="text-primary font-bold text-sm mb-1">Winner Count</h4>
              <p className="text-mutedBlue text-xs">{featured?.winner_count ?? 'Unavailable'}</p>
            </div>
          </div>
        </div>

        {/* Other Active Raffles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-primary tracking-tight">Other Campaigns</h3>
            <Link href="/current-raffle" className="text-secondary text-sm font-semibold hover:underline">
              View All Raffles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!loading && !error && otherRaffles.length === 0 && <p className="text-mutedBlue text-sm">No other campaigns are available.</p>}
            {otherRaffles.map((raffle, idx) => (
              <div key={raffle.id} className="bg-white border border-borderBlue rounded-2xl overflow-hidden shadow-card flex flex-col justify-between">
                <div>
                  <div className="h-48 relative overflow-hidden">
                    <img src={images[idx % images.length]} alt="Travel destination" className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-success text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {raffle.status}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-primary font-bold text-base">{raffle.name}</h4>
                      <p className="text-mutedBlue text-xs">{raffle.destination}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-mutedBlue pt-2 border-t border-borderBlue">
                      <span>Price: <strong className="text-primary">${raffle.coupon_price_usd} USD</strong></span>
                      <span>Limit: <strong className="text-primary">{raffle.max_capacity.toLocaleString()}</strong></span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-mutedBlue">Progress</span>
                        <span className="text-primary">{(100 * raffle.current_entries / raffle.max_capacity).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-lightBlue rounded-pill overflow-hidden">
                        <div className="h-full bg-accent rounded-pill" style={{ width: `${100 * raffle.current_entries / raffle.max_capacity}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    href={`/raffles/${raffle.id}`}
                    className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold text-xs py-2.5 rounded-xl shadow transition-colors"
                  >
                    View Campaign →
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
                href={featured ? `/raffles/${featured.id}` : '/current-raffle'}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold px-7 py-3 rounded-pill shadow-md transition-transform transform hover:scale-105 text-sm"
              >
                View Campaigns
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
