'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminCampaign, campaignError } from '@/lib/admin-campaigns';

type Fields = {
  name: string; description: string; destination: string; prize_value: string; currency: string;
  coupon_price: string; max_capacity: string; winner_count: string; start_date: string; end_date: string; is_featured: boolean;
};

const blank: Fields = { name: '', description: '', destination: '', prize_value: '', currency: 'USD', coupon_price: '10.00', max_capacity: '10', winner_count: '1', start_date: '', end_date: '', is_featured: false };

function localDateTime(value: string): string {
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromCampaign(campaign: AdminCampaign): Fields {
  return {
    name: campaign.name, description: campaign.description || '', destination: campaign.destination,
    prize_value: campaign.prize_value, currency: campaign.currency, coupon_price: campaign.coupon_price,
    max_capacity: String(campaign.max_capacity), winner_count: String(campaign.winner_count),
    start_date: localDateTime(campaign.start_date), end_date: localDateTime(campaign.end_date),
    is_featured: campaign.is_featured,
  };
}

function toApi(fields: Fields) {
  return {
    name: fields.name.trim(), description: fields.description.trim() || null, destination: fields.destination.trim(),
    prize_value: Number(fields.prize_value), currency: fields.currency, coupon_price: Number(fields.coupon_price),
    max_capacity: Number(fields.max_capacity), winner_count: Number(fields.winner_count),
    start_date: new Date(fields.start_date).toISOString(), end_date: new Date(fields.end_date).toISOString(), is_featured: fields.is_featured,
  };
}

export default function CampaignForm({ campaign, onSaved }: { campaign?: AdminCampaign; onSaved?: (updated: AdminCampaign) => void }) {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(() => campaign ? fromCampaign(campaign) : blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const locked = Boolean(campaign && (campaign.current_entries || campaign.issued_count || campaign.unused_reservations || campaign.active_holds));
  const drawLocked = campaign?.status === 'completed';
  const inputClass = 'w-full bg-lightBlue border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none disabled:opacity-60';
  const set = (key: keyof Fields, value: string | boolean) => setFields(previous => ({ ...previous, [key]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setSuccess('');
    if (new Date(fields.start_date) >= new Date(fields.end_date)) { setError('End date and time must be after start date and time.'); return; }
    if (Number(fields.winner_count) > Number(fields.max_capacity)) { setError('Winner count cannot exceed entry capacity.'); return; }
    const all = toApi(fields);
    const old = campaign ? toApi(fromCampaign(campaign)) : null;
    const body = old ? Object.fromEntries(Object.entries(all).filter(([key, value]) => value !== old[key as keyof typeof old])) : all;
    if (old && Object.keys(body).length === 0) { setError('No changes to save.'); return; }
    setSaving(true);
    try {
      const response = await fetch(campaign ? `/api/v1/admin/campaigns/${campaign.id}` : '/api/v1/admin/campaigns', {
        method: campaign ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await campaignError(response));
      const updated: AdminCampaign = await response.json();
      if (campaign) { setSuccess('Campaign saved.'); onSaved?.(updated); }
      else router.push(`/admin/campaigns/${updated.id}`);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to save campaign.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6">
      <h3 className="text-xl font-extrabold text-primary">Campaign Details</h3>
      {locked && <p className="text-mutedBlue text-xs">Coupon or checkout commitments exist. Prize, destination, price, winner count and dates are locked. Display copy and capacity remain editable subject to server limits.</p>}
      {error && <p role="alert" className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs font-semibold text-red-500">{error} {error.includes('session has expired') && <Link href="/sign-in" className="text-secondary hover:underline">Sign in again</Link>}</p>}
      {success && <p role="status" className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 text-xs font-semibold text-success">{success}</p>}
      <form onSubmit={save} className="space-y-4">
        <div>
          <label htmlFor="campaign-name" className="block text-xs font-bold text-primary mb-1">Campaign Name *</label>
          <input id="campaign-name" required minLength={2} type="text" value={fields.name} onChange={event => set('name', event.target.value)} placeholder="Enter campaign name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="campaign-description" className="block text-xs font-bold text-primary mb-1">Description</label>
          <textarea id="campaign-description" rows={3} value={fields.description} onChange={event => set('description', event.target.value)} placeholder="Enter campaign description" className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label htmlFor="campaign-destination" className="block text-xs font-bold text-primary mb-1">Destination *</label>
          <input id="campaign-destination" required minLength={2} value={fields.destination} disabled={locked} onChange={event => set('destination', event.target.value)} placeholder="Enter destination" className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="campaign-prize" className="block text-xs font-bold text-primary mb-1">Prize Value *</label>
            <input id="campaign-prize" required min="0.01" step="0.01" type="number" value={fields.prize_value} disabled={locked} onChange={event => set('prize_value', event.target.value)} placeholder="Enter prize value" className={inputClass} />
          </div>
          <div>
            <label htmlFor="campaign-currency" className="block text-xs font-bold text-primary mb-1">Currency</label>
            <select id="campaign-currency" value={fields.currency} disabled={locked} onChange={event => set('currency', event.target.value)} className={inputClass}>
              <option>USD</option><option>EUR</option><option>GBP</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="campaign-price" className="block text-xs font-bold text-primary mb-1">Coupon Price *</label>
            <input id="campaign-price" required type="text" value="$10.00 USD" disabled className={inputClass} />
          </div>
          <div>
            <label htmlFor="campaign-capacity" className="block text-xs font-bold text-primary mb-1">Entry Capacity *</label>
            <input id="campaign-capacity" required min="1" step="1" type="number" value={fields.max_capacity} disabled={drawLocked} onChange={event => set('max_capacity', event.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="campaign-winners" className="block text-xs font-bold text-primary mb-1">Winner Count *</label>
          <input id="campaign-winners" required min="1" step="1" type="number" value={fields.winner_count} disabled={locked} onChange={event => set('winner_count', event.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="campaign-start" className="block text-xs font-bold text-primary mb-1">Start date and time *</label>
            <input id="campaign-start" required type="datetime-local" value={fields.start_date} disabled={locked} onChange={event => set('start_date', event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="campaign-end" className="block text-xs font-bold text-primary mb-1">Registration closes *</label>
            <input id="campaign-end" required type="datetime-local" value={fields.end_date} disabled={locked} onChange={event => set('end_date', event.target.value)} className={inputClass} />
          </div>
        </div>
        <p className="text-mutedBlue text-xs">Times use your browser timezone; the server stores UTC.</p>
        <label className="flex items-center gap-2 text-xs font-bold text-primary"><input type="checkbox" checked={fields.is_featured} onChange={event => set('is_featured', event.target.checked)} /> Feature this campaign on the home page</label>
        <div className="pt-4 flex gap-3">
          <button disabled={saving} type="submit" className="flex-1 bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save Campaign'}</button>
          <Link href="/admin/campaigns" className="px-6 py-3.5 rounded-xl border border-borderBlue bg-white text-primary font-semibold text-sm hover:bg-lightBlue transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
