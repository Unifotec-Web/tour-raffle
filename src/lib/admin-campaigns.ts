export type AdminCampaign = {
  id: string;
  name: string;
  description: string | null;
  destination: string;
  prize_value: string;
  currency: string;
  coupon_price: string;
  max_capacity: number;
  winner_count: number;
  current_entries: number;
  status: string;
  start_date: string;
  end_date: string;
  is_featured: boolean;
  allowed_transitions: string[];
};

export async function campaignError(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) return 'Your session has expired. Please sign in again.';
  if (response.status === 403) return 'You do not have permission to manage campaigns.';
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail)) return body.detail.map((issue: { msg?: string }) => issue.msg || 'Invalid value').join(' ');
  return 'The campaign request could not be completed.';
}
