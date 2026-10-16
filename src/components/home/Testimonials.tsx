import React from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

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
                  <h3 className="text-2xl font-extrabold text-primary tracking-tight mb-1">Join Thousands of Dreamers</h3>
                  <p className="text-textBlue text-sm font-medium">Real people. Real entries. Real opportunities.</p>
                </div>
                <div className="flex items-center gap-1">
                  <button aria-label="Previous testimonial" className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary hover:bg-lightBlue transition-colors shadow-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button aria-label="Next testimonial" className="w-8 h-8 rounded-full bg-white border border-borderBlue flex items-center justify-center text-secondary hover:bg-lightBlue transition-colors shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative pt-2">
                <Quote className="w-8 h-8 text-secondary/30 mb-2 rotate-180" />
                <p className="text-primary text-sm sm:text-base font-normal italic leading-relaxed mb-6">
                  &quot;The process was simple and secure. I love the transparency and the beautiful destinations. Definitely worth it!&quot;
                </p>
              </div>
            </div>

            {/* User Profile & Pagination Dots */}
            <div className="flex items-center justify-between pt-4 border-t border-borderBlue">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Sarah M."
                  className="w-10 h-10 rounded-full object-cover border border-borderBlue"
                />
                <div>
                  <h4 className="text-primary font-bold text-sm">Sarah M.</h4>
                  <p className="text-mutedBlue text-xs">Canada</p>
                </div>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="w-2 h-2 rounded-full bg-borderBlue"></span>
                <span className="w-2 h-2 rounded-full bg-borderBlue"></span>
                <span className="w-2 h-2 rounded-full bg-borderBlue"></span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
