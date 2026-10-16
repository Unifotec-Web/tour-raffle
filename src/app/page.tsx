import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CampaignProgress from '@/components/home/CampaignProgress';
import CurrentRaffle from '@/components/home/CurrentRaffle';
import HowItWorks from '@/components/home/HowItWorks';
import TravelBanner from '@/components/home/TravelBanner';
import ActivityAndInfoSection from '@/components/home/ActivityAndInfoSection';
import TrustSection from '@/components/home/TrustSection';
import Testimonials from '@/components/home/Testimonials';
import FAQSection from '@/components/home/FAQSection';
import FinalCTA from '@/components/home/FinalCTA';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <HeroSection />
      <CampaignProgress />
      <CurrentRaffle />
      <HowItWorks />
      <TravelBanner />
      <ActivityAndInfoSection />
      <TrustSection />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
