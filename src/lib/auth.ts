export type AuthUser = { id: string; email: string; full_name: string; role: string; is_verified: boolean };

export async function authRequest(path: string, body: unknown): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch(`/api/v1/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Unable to reach the server. Please try again.');
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(typeof data.detail === 'string' ? data.detail : 'Please check your details and try again.');
  }
  return response.json();
}
