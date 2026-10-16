import React from 'react';
import RecentActivity from './RecentActivity';
import CampaignInformation from './CampaignInformation';

export default function ActivityAndInfoSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity />
          <CampaignInformation />
        </div>
      </div>
    </section>
  );
}
