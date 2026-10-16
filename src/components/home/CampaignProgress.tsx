import React from 'react';
import { RotateCw } from 'lucide-react';

export default function CampaignProgress() {
  return (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 mb-12">
      <div className="bg-[#002B49] border border-white/15 rounded-2xl p-6 sm:p-8 text-white shadow-progress">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Campaign Progress</h3>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-mutedBlue">
            <span className="flex items-center gap-1.5 text-success font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Live
            </span>
            <span>•</span>
            <span className="text-white/80">Last updated: Oct 12, 2025 10:34 AM</span>
            <button aria-label="Refresh campaign progress" className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors ml-1">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2 mb-8">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-mutedBlue">Overall Progress</span>
            <span className="text-accent text-lg font-extrabold">27.9%</span>
          </div>
          <div className="h-3.5 bg-[#17628A] rounded-pill overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#FFD15A] to-[#FFB92E] rounded-pill transition-all duration-1000"
              style={{ width: '27.9%' }}
            ></div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/15">
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Total Limit</div>
            <div className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">450,000</div>
          </div>
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Valid Entries</div>
            <div className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">125,432</div>
          </div>
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Remaining</div>
            <div className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">324,568</div>
          </div>
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Filled</div>
            <div className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">27.9%</div>
          </div>
        </div>

      </div>
    </div>
  );
}
