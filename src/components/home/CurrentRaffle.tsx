"use client";
import { useEffect, useState } from 'react';
import { publicCampaigns, PublicCampaign } from '@/lib/public-campaigns';
import React from 'react';
import Link from 'next/link';
import { Tag, Database, Globe, ShieldCheck, ExternalLink, Link2, Calendar, Headphones } from 'lucide-react';

export default function CurrentRaffle() {
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { publicCampaigns().then(rows => setCampaign(rows.find(row => row.is_featured) ?? rows[0] ?? null)).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  return (
    <section id="current-raffle" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary mb-8 tracking-tight">
          Current Raffle
        </h2>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Main Raffle Card (col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-borderBlue rounded-2xl p-6 sm:p-8 shadow-card">
            {loading && <p role="status" className="text-mutedBlue text-sm">Loading campaign...</p>}
            {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
            {!loading && !error && !campaign && <p className="text-mutedBlue text-sm">No campaign is available yet.</p>}
            {campaign &&
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

              {/* Destination Image */}
              <div className="md:col-span-5 h-[240px] md:h-[280px] rounded-xl overflow-hidden relative shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80"
                  alt="Travel destination"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Raffle Details */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-1">{campaign.name}</h3>
                  <p className="text-textBlue text-sm font-medium">{campaign.destination}</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-borderBlue">
                  <div>
                    <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                      <Tag className="w-3.5 h-3.5 text-secondary" /> Coupon Price
                    </div>
                    <div className="text-primary font-bold text-base">${campaign.coupon_price_usd} USD</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                      <Database className="w-3.5 h-3.5 text-secondary" /> Entry Limit
                    </div>
                    <div className="text-primary font-bold text-base">{campaign.max_capacity.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-mutedBlue text-xs mb-0.5">
                      <Globe className="w-3.5 h-3.5 text-secondary" /> Winners
                    </div>
                    <div className="text-primary font-bold text-xs truncate">{campaign.winner_count}</div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  Entry Registration: <span className="text-primary font-bold">{campaign.status}</span>
                </div>

                {/* Instructions */}
                <div className="bg-ice rounded-xl p-3.5 text-xs text-textBlue space-y-1">
                  <div className="font-bold text-primary mb-1">How to Enter:</div>
                  <ol className="list-decimal list-inside space-y-0.5 pl-1">
                    <li>Purchase a $10 USD coupon with a unique code.</li>
                    <li>Register your code on the platform.</li>
                    <li>Get an entry into the next draw.</li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={`/raffles/${campaign.id}`}
                    className="flex-1 text-center bg-white hover:bg-lightBlue text-primary font-semibold text-sm py-3 px-4 rounded-xl border border-[#8ACFE9] transition-colors shadow-sm"
                  >
                    View Raffle Details
                  </Link>
                  {campaign.status === 'open' && campaign.available_checkout_slots > 0 && <Link
                    href="/dashboard/coupons/purchase"
                    className="flex-1 text-center bg-accent hover:bg-accent-hover text-primary font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all"
                  >
                    Get Coupons
                  </Link>}
                </div>

              </div>
            </div>}
          </div>

          {/* Right: Why Choose Tour Raffle Card (col-span-4) */}
          <div className="lg:col-span-4 bg-lightBlue border border-borderBlue rounded-2xl p-6 shadow-card">
            <h3 className="text-xl font-extrabold text-primary mb-6 tracking-tight">Why Choose Tour Raffle?</h3>

            <div className="space-y-4">

              {/* Item 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Unique Coupon Codes</h4>
                  <p className="text-mutedBlue text-xs">Each code is unique and single-use.</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Single-Use Validation</h4>
                  <p className="text-mutedBlue text-xs">Prevents duplicate entries and fraud.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Transparent Progress</h4>
                  <p className="text-mutedBlue text-xs">Progress comes from campaign records.</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Secure Draw Process</h4>
                  <p className="text-mutedBlue text-xs">Draw records are published after selection.</p>
                </div>
              </div>

              {/* Item 5 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-primary font-bold text-sm">Published Results</h4>
                  <p className="text-mutedBlue text-xs">Official winners and results.</p>
                </div>
              </div>

              {/* Item 6 */}
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

      </div>
    </section>
  );
}
