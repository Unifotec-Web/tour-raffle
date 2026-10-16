'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { Search, Plus, Minus, Headphones } from 'lucide-react';

export default function FAQsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>('getting-started-0');

  const categories = [
    { name: 'All Questions', count: 20 },
    { name: 'Getting Started', count: 5 },
    { name: 'Coupons & Payments', count: 5 },
    { name: 'Entries & Draws', count: 4 },
    { name: 'Winners & Prizes', count: 4 },
    { name: 'Account & Security', count: 4 },
    { name: 'Technical Issues', count: 3 },
    { name: 'Other', count: 2 },
  ];

  const faqGroups = [
    {
      category: 'Getting Started',
      questions: [
        { q: 'What is Tour Raffle?', a: 'Tour Raffle is a transparent travel and raffle platform where participants can purchase coupons with unique codes to enter prize draws for breathtaking luxury tropical destinations.' },
        { q: 'How does Tour Raffle work?', a: 'Just purchase a $10 coupon, receive your unique code, register your entry on our platform, and follow the live campaign progress until the official draw.' },
        { q: 'Do I need to be 18 or older to enter?', a: 'Yes, participants must be at least 18 years of age or the legal age of majority in their jurisdiction to purchase coupons and enter raffles.' },
        { q: 'Is Tour Raffle available in my country?', a: 'Tour Raffle is available internationally, subject to local regulations regarding promotional raffles and contests.' }
      ]
    },
    {
      category: 'Coupons & Payments',
      questions: [
        { q: 'What payment methods do you accept?', a: 'We accept major credit/debit cards (Visa, MasterCard, American Express) and secure digital payment gateways.' },
        { q: 'How much does a coupon cost?', a: 'Each standard raffle coupon costs $10 USD.' },
        { q: 'Can I get a refund?', a: 'Coupon purchases are final once the unique coupon code has been generated and issued.' },
        { q: 'When will I receive my coupon code?', a: 'Coupon codes are delivered instantly to your registered email address and displayed in your account dashboard immediately after successful payment.' }
      ]
    },
    {
      category: 'Entries & Draws',
      questions: [
        { q: 'How do I enter the raffle?', a: 'Navigate to the Check Entry or Enter Raffle page, sign in, input your unique coupon code, and submit it for instant validation.' },
        { q: 'Can I use multiple coupon codes?', a: 'Yes! You can purchase and register multiple coupon codes to increase your chances of winning.' },
        { q: 'What happens if I enter the wrong code?', a: 'The system will notify you if a code is invalid, allowing you to re-check and enter the correct code.' },
        { q: 'When is the draw date?', a: 'Official draw dates are published on each raffle campaign page and held once campaign entry limits are reached.' }
      ]
    },
    {
      category: 'Winners & Prizes',
      questions: [
        { q: 'How will I know if I\'ve won?', a: 'Winners are notified via official email and announced publicly on our Winners page.' },
        { q: 'What if I\'m a winner, how do I claim my prize?', a: 'Our support team will contact you directly with verification steps and travel booking coordination.' },
        { q: 'Are the prizes transferable?', a: 'Prizes are non-transferable and awarded to the verified winner.' },
        { q: 'Do I need a passport to travel?', a: 'Yes, international travel prizes require a valid passport with at least 6 months validity.' }
      ]
    },
    {
      category: 'Account & Security',
      questions: [
        { q: 'How do I create an account?', a: 'Click Sign In / Register at the top right of the page and follow the quick signup steps.' },
        { q: 'How do I reset my password?', a: 'Use the forgot password link on the sign-in page to receive a secure reset link.' },
        { q: 'Is my personal information safe?', a: 'We use industry-standard encryption and secure protocols to protect your data.' },
        { q: 'Can I delete my account?', a: 'Yes, you can request account deletion by contacting customer support.' }
      ]
    }
  ];

  const toggleFAQ = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Frequently Asked Questions"
        description="Find answers to the most common questions about Tour Raffle. Can't find what you're looking for? Contact our support team."
        breadcrumb="FAQs"
        bgImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a question..."
            className="w-full bg-lightBlue border border-borderBlue rounded-full py-4 pl-6 pr-12 text-sm text-primary placeholder-mutedBlue shadow-sm focus:outline-none focus:border-secondary transition-colors"
          />
          <Search className="absolute right-5 top-4 w-5 h-5 text-mutedBlue" />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar (col-span-4) */}
          <div className="lg:col-span-4 bg-lightBlue border border-borderBlue rounded-2xl p-4 shadow-sm">
            <ul className="space-y-1">
              {categories.map((cat, idx) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <li key={idx}>
                    <button
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary text-white font-bold shadow-sm'
                          : 'text-primary hover:bg-white/60'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-borderBlue text-mutedBlue'}`}>
                        {cat.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* FAQ Accordions (col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            {faqGroups.map((group, groupIdx) => {
              if (selectedCategory !== 'All Questions' && selectedCategory !== group.category) {
                return null;
              }
              return (
                <div key={groupIdx} className="space-y-4">
                  <h3 className="text-xl font-extrabold text-primary tracking-tight pb-2 border-b border-borderBlue">
                    {group.category}
                  </h3>
                  <div className="space-y-3">
                    {group.questions.map((faq, qIdx) => {
                      const key = `${groupIdx}-${qIdx}`;
                      const isOpen = openIndex === key;
                      return (
                        <div key={qIdx} className="bg-[#F7FCFF] border border-borderBlue rounded-xl overflow-hidden transition-all">
                          <button
                            onClick={() => toggleFAQ(key)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                          >
                            <span className="text-primary font-bold text-sm sm:text-base">{faq.q}</span>
                            <div className="w-7 h-7 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shrink-0">
                              {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-5 pt-1 text-mutedBlue text-sm leading-relaxed border-t border-borderBlue/50">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Support CTA Banner */}
        <div className="bg-lightBlue border border-borderBlue rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 shadow">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-1">Still have questions?</h3>
              <p className="text-mutedBlue text-sm">Our support team is here to help you 24/7.</p>
            </div>
          </div>
          <Link
            href="#support"
            className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-transform transform hover:scale-105 text-sm shrink-0"
          >
            Contact Support →
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}
