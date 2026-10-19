export type PublicCampaign = {
  id: string; name: string; description: string; destination: string;
  prize_value: string; prize_currency: string; coupon_price_usd: string;
  max_capacity: number; current_entries: number; remaining_registration_slots: number;
  available_checkout_slots: number; winner_count: number; status: string;
  start_date: string; end_date: string; is_featured: boolean;
};

export async function publicCampaigns(): Promise<PublicCampaign[]> {
  const response = await fetch('/api/v1/campaigns/public', { cache: 'no-store' });
  if (!response.ok) throw new Error('Campaigns are unavailable. Please try again.');
  return response.json();
}

export async function publicCampaign(id: string): Promise<PublicCampaign | null> {
  const response = await fetch(`/api/v1/campaigns/public/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (response.status === 404 || response.status === 422) return null;
  if (!response.ok) throw new Error('Campaign details are unavailable. Please try again.');
  return response.json();
}
