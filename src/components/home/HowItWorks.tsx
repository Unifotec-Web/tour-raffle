import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Purchase a Coupon',
      description: 'Buy a $10 coupon through an approved payment method when sales are available.'
    },
    {
      number: '2',
      title: 'Receive Your Unique Code',
      description: 'Get the unique code associated with your purchase.'
    },
    {
      number: '3',
      title: 'Register Your Entry',
      description: 'Sign in, submit your code, and receive confirmation after successful validation.'
    },
    {
      number: '4',
      title: 'Follow the Draw',
      description: 'Monitor campaign progress and check for official winner announcements.'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 relative bg-primary-dark">
      {/* Background overlay image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80')`
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            How It Works
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Just 4 simple steps to enter and win
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-6 text-center h-full flex flex-col items-center justify-between shadow-card hover:shadow-card-hover transition-all">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-extrabold text-lg flex items-center justify-center mb-5 shadow-md">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-primary font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-mutedBlue text-xs leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
