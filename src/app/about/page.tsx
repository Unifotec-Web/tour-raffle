import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import { ShieldCheck, Users, Globe, Award } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="About Us"
        description="Our mission is to make your dream destinations a reality."
        breadcrumb="About Us"
        bgImage="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Mission Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-3xl font-extrabold text-primary tracking-tight">Tour Raffle Platform</h3>
            <p className="text-textBlue text-base leading-relaxed">
              Tour Raffle is a global travel platform that gives you the chance to win incredible travel experiences. We believe that everyone deserves the opportunity to explore the world, and we are here to make that possible.
            </p>
            <p className="text-mutedBlue text-sm leading-relaxed">
              Through transparent campaigns, secure coupon validation, and verified draws, we connect travelers with breathtaking destinations across the globe.
            </p>
          </div>
          <div className="h-[320px] rounded-2xl overflow-hidden shadow-card">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80" alt="About Tour Raffle" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Core Values */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-2">Our Core Values</h3>
            <p className="text-mutedBlue text-sm">The principles that guide everything we do.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-4 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-primary font-bold text-base mb-1">Trust & Transparency</h4>
              <p className="text-mutedBlue text-xs">Uncompromising honesty and verified public draws.</p>
            </div>

            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-4 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-primary font-bold text-base mb-1">Customer First</h4>
              <p className="text-mutedBlue text-xs">Dedicated 24/7 support and seamless user experiences.</p>
            </div>

            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-4 shadow-sm">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-primary font-bold text-base mb-1">Global Community</h4>
              <p className="text-mutedBlue text-xs">Bringing people together through travel and adventure.</p>
            </div>

            <div className="bg-lightBlue border border-borderBlue rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary mx-auto mb-4 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-primary font-bold text-base mb-1">Dreams Happen</h4>
              <p className="text-mutedBlue text-xs">Because the world is better when we explore it.</p>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
