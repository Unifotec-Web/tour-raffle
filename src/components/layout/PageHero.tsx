import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb: string;
  bgImage?: string;
}

export default function PageHero({ title, subtitle, description, breadcrumb, bgImage }: PageHeroProps) {
  const imageSrc = bgImage || '/hero.png';

  return (
    <section className="relative min-h-[300px] pt-32 pb-16 flex items-center bg-primary-dark overflow-hidden">
      {/* Background Image with Gradient Overlay using hero.png */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0, 31, 56, 0.92) 0%, rgba(0, 44, 73, 0.70) 50%, rgba(0, 44, 73, 0.20) 100%), url('${imageSrc}')`
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-white/70 mb-3">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <span className="text-accent">{breadcrumb}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-2">
              {subtitle}
            </h2>
          )}

          {/* Description */}
          {description && (
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
