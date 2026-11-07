'use client';
import { useEffect, useState } from 'react';
export function CompetitionCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000)));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);
  const minutes = remaining === null ? '--' : String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = remaining === null ? '--' : String(remaining % 60).padStart(2, '0');
  return <div role="timer" aria-label="Competition time remaining" className="mt-5 rounded-xl bg-indigo-50 p-4"><p className="text-sm font-semibold text-indigo-700">Time remaining</p><p className="mt-1 font-mono text-3xl font-bold tabular-nums text-indigo-900">{minutes}:{seconds}</p>{remaining === 0 && <p className="mt-2 text-sm text-indigo-800">Time is up. Refresh to see the final result.</p>}</div>;
}
