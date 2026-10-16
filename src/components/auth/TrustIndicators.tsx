import React from 'react';
import { Globe, ShieldCheck, Trophy } from 'lucide-react';

export default function TrustIndicators() {
  return (
    <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/15 text-white text-center">
      <div className="flex flex-col items-center">
        <Globe className="w-5 h-5 text-accent mb-1.5" />
        <span className="text-xs font-semibold leading-tight">Exclusive Dream Destinations</span>
      </div>
      <div className="flex flex-col items-center">
        <ShieldCheck className="w-5 h-5 text-accent mb-1.5" />
        <span className="text-xs font-semibold leading-tight">Secure & Trusted</span>
      </div>
      <div className="flex flex-col items-center">
        <Trophy className="w-5 h-5 text-accent mb-1.5" />
        <span className="text-xs font-semibold leading-tight">Real Winners</span>
      </div>
    </div>
  );
}
