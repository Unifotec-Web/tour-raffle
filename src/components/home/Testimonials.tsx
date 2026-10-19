import React from 'react';
import Link from 'next/link';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left: Tropical Photo */}
          <div className="h-[320px] sm:h-[380px] rounded-2xl overflow-hidden shadow-card">
            <img
              src="https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1000&q=80"
              alt="Tropical destination"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Testimonial Card */}
          <div className="bg-ice rounded-2xl p-8 sm:p-10 shadow-card flex flex-col justify-between h-[320px] sm:h-[380px] relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-1">Explore the Campaign</h3>
                  <p className="text-textBlue text-sm font-medium">Published campaign details and registration progress.</p>
                </div>
              </div>

              <div className="relative pt-2">
                <Quote className="w-8 h-8 text-secondary/30 mb-2 rotate-180" />
                <p className="text-primary text-sm sm:text-base font-normal italic leading-relaxed mb-6">
                  Review the campaign information before deciding whether to participate. Purchase a coupon and register it before closure to create an entry.
                </p>
              </div>
            </div>

            {/* Campaign link in the existing card footer */}
            <div className="flex items-center justify-between pt-4 border-t border-borderBlue">
              <Link href="/current-raffle" className="text-secondary text-sm font-bold hover:underline">View campaigns →</Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
