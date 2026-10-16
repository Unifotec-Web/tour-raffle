import React from 'react';
import { Database, CheckCircle, Clock, RotateCw, BarChart2 } from 'lucide-react';

export default function CampaignInformation() {
  return (
    <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-primary tracking-tight">Campaign Information</h3>
          <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full border border-success/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            Open
          </span>
        </div>

        {/* Info Rows */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between py-2 border-b border-borderBlue">
            <span className="text-mutedBlue text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-secondary" /> Total Capacity
            </span>
            <span className="text-primary font-bold text-sm">450,000</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-borderBlue">
            <span className="text-mutedBlue text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-secondary" /> Valid Entries
            </span>
            <span className="text-primary font-bold text-sm">125,432</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-borderBlue">
            <span className="text-mutedBlue text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" /> Remaining Entries
            </span>
            <span className="text-primary font-bold text-sm">324,568</span>
          </div>

          <div className="py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-mutedBlue text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-secondary" /> Progress
              </span>
              <span className="text-primary font-bold text-sm">27.9%</span>
            </div>
            <div className="h-3 bg-lightBlue rounded-pill overflow-hidden p-0.5 border border-borderBlue">
              <div
                className="h-full bg-gradient-to-r from-accent to-[#FFB92E] rounded-pill"
                style={{ width: '27.9%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="pt-4 border-t border-borderBlue flex items-center justify-between text-xs text-mutedBlue">
        <span>Last updated: Oct 12, 2025 10:34 AM</span>
        <button aria-label="Refresh campaign information" className="p-1 rounded-full hover:bg-lightBlue text-secondary transition-colors">
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
