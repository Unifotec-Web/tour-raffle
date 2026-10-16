import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function TravelBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden min-h-[220px] flex items-center shadow-card">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0, 31, 56, 0.85) 0%, rgba(0, 44, 73, 0.50) 60%, rgba(0, 44, 73, 0.20) 100%), url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80')`
            }}
          />

          <div className="relative z-10 px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-6">
            <div>
              <h2 className="font-caveat text-4xl sm:text-5xl font-medium text-white leading-tight">
                Explore New Places
              </h2>
              <h2 className="font-caveat text-4xl sm:text-5xl font-medium text-white leading-tight mb-3">
                Create Lasting Memories
              </h2>
              <p className="text-white/80 text-xs sm:text-sm font-normal">
                Your next adventure could be closer than you think.
              </p>
            </div>

            <button
              aria-label="Explore more"
              className="w-12 h-12 rounded-full border-2 border-accent text-accent flex items-center justify-center hover:bg-accent hover:text-primary transition-all shadow-md shrink-0"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
