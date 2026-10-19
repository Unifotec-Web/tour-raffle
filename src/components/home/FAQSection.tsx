'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Tour Raffle?",
      answer: "Tour Raffle is a transparent travel and raffle platform where participants can purchase coupons with unique codes to enter prize draws for breathtaking luxury tropical destinations."
    },
    {
      question: "How much does a coupon cost?",
      answer: "Each coupon costs $10 USD. Every valid coupon code registered grants you an entry into the active campaign draw."
    },
    {
      question: "How do I register my code?",
      answer: "Simply sign in to your account, navigate to the entry registration page, input your unique coupon code from your purchase receipt, and submit it for validation."
    },
    {
      question: "Can I get a refund?",
      answer: "Coupon purchases are final once the unique code has been generated and issued, as per our participation terms and secure draw regulations."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-textBlue text-sm sm:text-base">
              Find answers to the most common questions about Tour Raffle.
            </p>
          </div>
          <Link
            href="/faqs"
            className="bg-white hover:bg-lightBlue text-primary font-bold text-sm px-5 py-2.5 rounded-pill border border-borderBlue transition-colors shadow-sm self-start sm:self-auto"
          >
            View All FAQs →
          </Link>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#F7FCFF] border border-borderBlue rounded-xl transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-primary font-bold text-base">{faq.question}</span>
                  <div className="w-7 h-7 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shrink-0">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-mutedBlue text-sm leading-relaxed border-t border-borderBlue/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
