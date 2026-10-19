export type Order = {
  id: string; campaign_id: string; quantity: number; unit_amount: string; total_amount: string;
  currency: string; paid_amount: string | null; paid_currency: string | null;
  provider: 'fake' | 'stripe' | 'paystack'; reference: string | null; status: string;
  payment_status: string; issuance_status: string; remedy_status: string;
  checkout_url: string | null; hold_expires_at: string | null; created_at: string; paid_at: string | null;
};
export async function orderRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Your session has expired. Please sign in again.');
    const data = await response.json().catch(() => ({}));
    throw new Error(typeof data.detail === 'string' ? data.detail : 'Request failed. Please try again.');
  }
  return response.json();
}
