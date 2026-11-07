'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function ChallengeActions({ id, status, isOpponent, isParticipant }: { id: string; status: string; isOpponent: boolean; isParticipant: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function act(action: 'accept' | 'decline' | 'ready') {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/challenges/${id}/${action}`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Action failed.');
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update challenge.'); }
    finally { setBusy(false); }
  }
  return <div className="mt-5">
    <div className="flex flex-wrap gap-2">
      {status === 'PENDING' && isOpponent && <><button disabled={busy} onClick={() => act('accept')} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Accept</button><button disabled={busy} onClick={() => act('decline')} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Decline</button></>}
      {status === 'ACTIVE' && isParticipant && <button disabled={busy} onClick={() => act('ready')} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">I'm ready</button>}
      <button onClick={() => router.push(`/challenges/${id}`)} className="rounded-lg border px-4 py-2 text-sm font-semibold">View details</button>
    </div>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>;
}
