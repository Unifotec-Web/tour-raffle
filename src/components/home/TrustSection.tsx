import React from 'react';
import { Tag, ShieldCheck, ExternalLink, Link2, Calendar, Headphones } from 'lucide-react';

export default function TrustSection() {
  const trustFeatures = [
    {
      icon: <Tag className="w-6 h-6 text-secondary" />,
      title: 'Unique Coupon Codes',
      description: 'One code per purchase.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-secondary" />,
      title: 'Single-Use Validation',
      description: 'Prevents duplicate entries.'
    },
    {
      icon: <ExternalLink className="w-6 h-6 text-secondary" />,
      title: 'Transparent Progress',
      description: 'Campaign progress from the server.'
    },
    {
      icon: <Link2 className="w-6 h-6 text-secondary" />,
      title: 'Secure Draw Process',
      description: 'Draw records available after publication.'
    },
    {
      icon: <Calendar className="w-6 h-6 text-secondary" />,
      title: 'Published Results',
      description: 'Official winners and results.'
    },
    {
      icon: <Headphones className="w-6 h-6 text-secondary" />,
      title: 'Reliable Support',
      description: 'Help when you need it.'
    }
  ];

  return (
    <section className="py-16 bg-[#F8FBFC] border-y border-borderBlue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-2">
            Your Trust Matters
          </h2>
          <p className="text-textBlue text-sm sm:text-base">
            We&apos;re committed to a fair, secure and transparent raffle experience.
          </p>
        </div>

        {/* 6 Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
          {trustFeatures.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center mb-4 shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-primary font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-mutedBlue text-xs leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
