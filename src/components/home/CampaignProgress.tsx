"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';

export default function CampaignProgress() {
  type Progress = { status: string; max_capacity: number; current_entries: number; remaining: number; percentage: number; updated_at: string };
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState('');
  const refresh = useCallback(() => {
    fetch('/api/v1/campaigns/featured/progress')
      .then(async response => { if (!response.ok) throw new Error('Campaign progress is unavailable.'); return response.json(); })
      .then(data => { setProgress(data); setError(''); })
      .catch(failure => { setProgress(null); setError(failure.message); });
  }, []);
  useEffect(() => { refresh(); const timer = window.setInterval(refresh, 15000); return () => window.clearInterval(timer); }, [refresh]);
  const number = (value?: number) => value === undefined ? '—' : value.toLocaleString();
  const updated = progress ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(`${progress.updated_at}Z`)).replace(/, (\d{1,2}:\d{2})/, ' $1') : error;
  return (
    <div className="relative z-20 w-full max-w-[713px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 mb-12">
      <div className="bg-[#002B49] border border-white/15 rounded-2xl p-6 sm:p-8 text-white shadow-progress">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Campaign Progress</h3>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-mutedBlue">
            <span className="flex items-center gap-1.5 text-success font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              {progress?.status === 'open' ? 'Live' : progress?.status ? progress.status[0].toUpperCase() + progress.status.slice(1) : 'Unavailable'}
            </span>
            <span>•</span>
            <span className="text-white/80">{progress ? `Last updated: ${updated}` : error}</span>
            <button aria-label="Refresh campaign progress" onClick={refresh} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors ml-1">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2 mb-8">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-mutedBlue">Overall Progress</span>
            <span className="text-accent text-lg font-extrabold">{progress ? `${progress.percentage}%` : '—'}</span>
          </div>
          <div className="h-3.5 bg-[#17628A] rounded-pill overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#FFD15A] to-[#FFB92E] rounded-pill transition-all duration-1000"
              style={{ width: `${progress?.percentage ?? 0}%` }}
            ></div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/15">
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Total Limit</div>
            <div className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">{number(progress?.max_capacity)}</div>
          </div>
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Valid Entries</div>
            <div className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">{number(progress?.current_entries)}</div>
          </div>
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Remaining</div>
            <div className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">{number(progress?.remaining)}</div>
          </div>
          <div>
            <div className="text-white/70 text-xs sm:text-sm font-medium mb-1">Filled</div>
            <div className="text-white text-xl sm:text-2xl font-extrabold tracking-tight">{progress ? `${progress.percentage}%` : '—'}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
