'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Refresh server-rendered competition state while registration is open,
 * the facilitator is preparing the start, or the quiz is running.
 * The server remains authoritative for all status and leaderboard data.
 */
export function CompetitionLiveRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const refresh = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    const interval = window.setInterval(refresh, 10000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [active, router]);

  return null;
}
