'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CampaignForm from '@/components/admin/CampaignForm';

export default function AdminCreateCampaignPage() {
  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Create Campaign</h1>
          <p className="text-mutedBlue text-sm">Set up a new raffle campaign or edit an existing one.</p>
        </div>
        <CampaignForm />
      </div>
    </AdminLayout>
  );
}
