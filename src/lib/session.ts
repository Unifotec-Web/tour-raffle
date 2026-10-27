'use client';

import { useEffect, useState } from 'react';
import type { AuthUser } from './auth';

const SESSION_EVENT = 'tour-raffle-session-change';
const STORAGE_KEY = 'tour-raffle-session-updated';

type SessionState = { status: 'loading' | 'signed-out' | 'signed-in'; user: AuthUser | null };

export function announceSessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
  try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* Storage may be disabled. */ }
}

export function useSession(pathname: string): SessionState {
  const [session, setSession] = useState<SessionState>({ status: 'loading', user: null });

  useEffect(() => {
    let controller: AbortController | null = null;
    const refresh = () => {
      controller?.abort();
      controller = new AbortController();
      const current = controller;
      setSession({ status: 'loading', user: null });
      fetch('/api/v1/auth/session', { credentials: 'include', cache: 'no-store', signal: current.signal })
        .then(async response => {
          if (!response.ok) return null;
          return response.json() as Promise<AuthUser>;
        })
        .then(user => {
          if (current.signal.aborted) return;
          setSession(user ? { status: 'signed-in', user } : { status: 'signed-out', user: null });
        })
        .catch(() => {
          if (!current.signal.aborted) setSession({ status: 'signed-out', user: null });
        });
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') refresh(); };
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) refresh(); };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener(SESSION_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      controller?.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      window.removeEventListener(SESSION_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pathname]);

  return session;
}

export async function logoutSession(): Promise<void> {
  const response = await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to sign out. Please try again.');
  announceSessionChange();
}
